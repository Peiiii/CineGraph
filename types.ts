
export type AssetType = 'image' | 'video' | 'text' | 'character' | 'scene';

export interface Asset {
  id: string;
  type: AssetType;
  content: string; 
  title: string;
  position: { x: number, y: number }; // 空间位置
  description?: string;
  metadata?: {
    prompt?: string;
    model?: string;
    aspectRatio?: string;
  };
  createdAt: number;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}
