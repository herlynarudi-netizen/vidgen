import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { GenerationOptions, ImageGenerationOptions } from '../types';
import { fileToBase64 } from '../utils/fileUtils';

const videoModel = 'veo-3.0-generate-001';
const imageEditModel = 'gemini-2.5-flash-image';
const textModel = 'gemini-2.5-flash';


export async function generateSnarkyVideoPrompts(mainPrompt: string, apiKey: string): Promise<string[]> {
    if (!apiKey) {
        throw new Error("Kunci API Google AI tidak dikonfigurasi.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
        model: textModel,
        contents: `Buat kampanye video untuk: "${mainPrompt}"`,
        config: {
            systemInstruction: "Anda adalah penulis naskah pemasaran yang jenaka dan sinis. Berdasarkan prompt pengguna, buat serangkaian 4 prompt video pendek yang saling terhubung untuk kampanye promosi. Setiap prompt harus dibangun di atas yang terakhir. Nada bicaranya harus sinis dan dalam Bahasa Indonesia. Kembalikan respons sebagai larik JSON dari 4 string. JANGAN menambahkan basa-basi atau penjelasan, hanya larik JSON.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.STRING,
                    description: 'Satu prompt video sinis'
                }
            }
        },
    });

    try {
        const jsonText = response.text.trim();
        const prompts = JSON.parse(jsonText);
        if (Array.isArray(prompts) && prompts.length > 0 && prompts.every(p => typeof p === 'string')) {
            return prompts.slice(0, 4); // Pastikan hanya mengembalikan maksimal 4
        }
        throw new Error("Respons model bukan larik string yang valid.");
    } catch (e) {
        console.error("Gagal mengurai respons JSON dari model:", response.text);
        throw new Error("Gagal membuat prompt video. Model mengembalikan format yang tidak terduga.");
    }
}


export async function generateImages(options: ImageGenerationOptions): Promise<string[]> {
    if (!options.apiKey) {
        throw new Error("Kunci API Google AI tidak dikonfigurasi.");
    }
    const ai = new GoogleGenAI({ apiKey: options.apiKey });

    const parts: any[] = [];
    
    let instruksiDasar = "";
    if (options.productImageFile && options.actorImageFile) {
        instruksiDasar = "Gabungkan dua subjek dari gambar yang diberikan ke dalam satu adegan yang kohesif. **Yang terpenting, Anda harus mempertahankan penampilan, fitur, dan pakaian orang tersebut, serta penampilan produk dengan tepat. Jangan mengubahnya.** Adegan akhir harus dipandu oleh deskripsi berikut:";
    } else if (options.productImageFile) {
        instruksiDasar = "Ambil produk dari gambar yang diberikan dan letakkan di adegan baru. **Jangan mengubah penampilan produk dengan cara apa pun.** Adegan tersebut harus dipandu oleh deskripsi berikut:";
    } else if (options.actorImageFile) {
        instruksiDasar = "Ambil orang dari gambar yang diberikan dan tempatkan mereka di adegan baru. **Jangan mengubah penampilan, wajah, atau pakaian orang tersebut.** Adegan tersebut harus dipandu oleh deskripsi berikut:";
    }

    const promptPengguna = options.prompt || (options.productImageFile && options.actorImageFile ? "latar belakang studio yang bersih dan netral" : "adegan yang menarik dan sesuai");
    
    let aspectRatioInstruction = "";
    switch (options.aspectRatio) {
        case '16:9':
            aspectRatioInstruction = " Gambar yang dihasilkan HARUS memiliki rasio aspek lanskap 16:9.";
            break;
        case '9:16':
            aspectRatioInstruction = " Gambar yang dihasilkan HARUS memiliki rasio aspek potret 9:16.";
            break;
        case '1:1':
            aspectRatioInstruction = " Gambar yang dihasilkan HARUS memiliki rasio aspek persegi 1:1.";
            break;
    }

    const qualityMandate = " Kualitas gambar harus sangat baik: fotorealistik, tajam, jernih, dan resolusi tinggi. Pastikan semua detail, terutama tangan dan wajah manusia, secara anatomis benar dan bebas dari cacat atau distorsi. Hindari gambar yang buram atau berkualitas rendah.";

    const promptLengkap = `${instruksiDasar} "${promptPengguna}".${aspectRatioInstruction}${qualityMandate}`;
    parts.push({ text: promptLengkap });


    // Tambahkan gambar ke dalam parts
    if (options.productImageFile) {
        const { base64, mimeType } = await fileToBase64(options.productImageFile);
        parts.push({ text: "GAMBAR PRODUK:" });
        parts.push({ inlineData: { mimeType, data: base64 } });
    }
    if (options.actorImageFile) {
        const { base64, mimeType } = await fileToBase64(options.actorImageFile);
        parts.push({ text: "GAMBAR AKTOR:" });
        parts.push({ inlineData: { mimeType, data: base64 } });
    }

    // Buat array promise untuk 4 panggilan API paralel
    const generationPromises = Array.from({ length: options.numberOfImages }, () => 
        ai.models.generateContent({
            model: imageEditModel,
            contents: { parts: parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT], 
            },
        })
    );
    
    const responses = await Promise.all(generationPromises);

    const imageUrls: string[] = [];
    
    // Ekstrak gambar dari setiap respons
    for (const response of responses) {
        let imageFoundInResponse = false;
        if (response.candidates && response.candidates.length > 0 && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    const mimeType = part.inlineData.mimeType;
                    imageUrls.push(`data:${mimeType};base64,${base64ImageBytes}`);
                    imageFoundInResponse = true;
                    break; // Ambil hanya gambar pertama per respons
                }
            }
        }
        if (!imageFoundInResponse) {
             // Jika satu panggilan gagal mengembalikan gambar, kita masih bisa melanjutkan dengan yang lain,
             // tetapi kita mungkin ingin mencatatnya atau menanganinya secara berbeda.
             console.warn("Satu panggilan pembuatan gambar tidak mengembalikan gambar.");
        }
    }


    if (imageUrls.length === 0) {
        throw new Error("Model tidak mengembalikan gambar apa pun. Coba lagi dengan prompt atau gambar yang berbeda.");
    }

    return imageUrls;
}


export async function generateIndividualVideo(
    prompt: string,
    options: GenerationOptions,
    image: { imageBytes: string; mimeType: string } | undefined,
    onProgress: (message: string) => void,
    apiKey: string,
): Promise<string> {

    if (!apiKey) {
        throw new Error("Kunci API Google AI tidak dikonfigurasi.");
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey });

        onProgress('Mengirim permintaan ke VEO...');

        let operation = await ai.models.generateVideos({
            model: videoModel,
            prompt: prompt,
            image: image,
            config: {
                numberOfVideos: 1,
                aspectRatio: options.aspectRatio,
            }
        });

        onProgress('Pembuatan video dimulai...');
        const pollInterval = 10000; // 10 detik
        let attempts = 0;
        const maxAttempts = 30; // batas waktu 5 menit

        while (!operation.done && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, pollInterval));
            onProgress(`Memeriksa status (percobaan ${attempts + 1})...`);
            operation = await ai.operations.getVideosOperation({ operation: operation });
            attempts++;
        }

        if (!operation.done) {
            throw new Error("Pembuatan video habis waktu setelah 5 menit.");
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (!downloadLink) {
            // Ini menangani kasus di mana operasi selesai tetapi gagal tanpa tautan unduhan.
            throw new Error("Pembuatan video selesai, tetapi tidak ada data video yang dikembalikan oleh API.");
        }
        
        onProgress('Mengambil data video...');
        // respons.body berisi byte MP4. Anda harus menambahkan kunci API saat mengambil dari tautan unduhan.
        const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
        if(!videoResponse.ok) {
            const errorBody = await videoResponse.text();
            throw new Error(`Gagal mengambil data video (${videoResponse.status}): ${errorBody}`);
        }

        const videoBlob = await videoResponse.blob();
        onProgress('Selesai.');
        return URL.createObjectURL(videoBlob);
    } catch (err) {
        console.error("Kesalahan detail selama pembuatan video:", err);
        if (err instanceof Error) {
            // Mencoba mengurai pesan kesalahan jika itu adalah JSON yang disematkan
            try {
                // Pesan kesalahan API sering kali berupa string JSON
                const errorJson = JSON.parse(err.message);
                if (errorJson.error && errorJson.error.message) {
                    // Ekstrak pesan yang mudah dibaca manusia
                    throw new Error(errorJson.error.message);
                }
            } catch (parseError) {
                // Bukan JSON, jadi lemparkan kembali pesan kesalahan asli
                throw err;
            }
        }
        // Fallback untuk jenis kesalahan lainnya
        throw new Error('Terjadi kesalahan yang tidak diketahui selama pembuatan video.');
    }
}