// Options for Image Generation
export interface ImageGenerationOptions {
  apiKey: string;
  prompt: string;
  productImageFile: File | null;
  actorImageFile: File | null;
  numberOfImages: number;
  aspectRatio: '1:1' | '16:9' | '9:16';
}

// Status for a single image generation
export type ImageStatus = 'pending' | 'generating' | 'done' | 'error';

// Result for a single image
export interface ImageResult {
  id: number;
  url: string | null;
  status: ImageStatus;
  error?: string;
}


// Options for Video Generation
export interface GenerationOptions {
  prompt: string;
  imageFile: File | null;
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
}

// Status for the video generation process
export type VideoStatus = 'pending' | 'generating' | 'done' | 'error';

// Result for the video generation
export interface VideoResult {
  id: number;
  url: string | null;
  status: VideoStatus;
  progressMessage?: string;
  error?: string;
}