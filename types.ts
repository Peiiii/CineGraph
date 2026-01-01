
export type AssetType = 'image' | 'video' | 'text' | 'character' | 'scene';

export interface Asset {
  id: string;
  type: AssetType;
  content: string; // Base64 for images/videos, string for text
  title: string;
  description?: string;
  metadata?: {
    prompt?: string;
    model?: string;
    aspectRatio?: string;
  };
  createdAt: number;
}

export enum TaskType {
  IMAGE_GEN = 'IMAGE_GEN',
  VIDEO_GEN = 'VIDEO_GEN',
  STORYBOARD = 'STORYBOARD',
  CHARACTER_DESIGN = 'CHARACTER_DESIGN',
}

export interface GenerationResult {
  id: string;
  type: AssetType;
  content: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}
