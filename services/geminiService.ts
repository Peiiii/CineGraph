
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Asset } from "../types";

export const filmTools: FunctionDeclaration[] = [
  {
    name: "create_visual_shot",
    description: "生成电影画面、分镜图片或角色视觉图。当需要视觉呈现时使用。",
    parameters: {
      type: Type.OBJECT,
      properties: {
        prompt: { type: Type.STRING, description: "高度详细的视觉描述（英文更佳），包含构图、光效、色彩。" },
        title: { type: Type.STRING, description: "给这个画面的简洁标题。" }
      },
      required: ["prompt", "title"]
    }
  },
  {
    name: "animate_scene",
    description: "将已有的分镜或图片转化为动态视频片段。需要指定引用的图片资产 ID 或描述。",
    parameters: {
      type: Type.OBJECT,
      properties: {
        prompt: { type: Type.STRING, description: "描述动作和镜头运动，如 'camera dollies in', 'character walks'。" },
        reference_asset_id: { type: Type.STRING, description: "参考图片的 ID（如果有）。" }
      },
      required: ["prompt"]
    }
  },
  {
    name: "write_creative_asset",
    description: "编写剧本片段、角色档案、场景设定等文字资产。这会直接在画布上创建一个文字卡片。",
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, enum: ["character", "scene", "script"], description: "资产类型。" },
        title: { type: Type.STRING, description: "资产标题。" },
        content: { type: Type.STRING, description: "详细的文字内容，支持 Markdown。" }
      },
      required: ["type", "title", "content"]
    }
  }
];

export class GeminiService {
  private static getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  static async chatWithAgentStream(message: string, contextAssets: Asset[]) {
    const ai = this.getClient();
    return ai.models.generateContentStream({
      model: "gemini-3-pro-preview",
      contents: [{ role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: `你是一位全能的 AI 电影导演。你的目标是通过调用工具来协助用户进行电影全流程创作。
        工作流建议：1. 剧本 2. 分镜 3. 动态。当前工作区资产：${JSON.stringify(contextAssets.map(a => ({id: a.id, type: a.type, title: a.title})))}。`,
        tools: [{ functionDeclarations: filmTools }]
      }
    });
  }

  static async generateImage(prompt: string) {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt
    });
    
    let base64 = "";
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) base64 = part.inlineData.data;
    }
    if (!base64) throw new Error("Image generation failed");
    return `data:image/png;base64,${base64}`;
  }

  static async generateVideo(prompt: string, imageBase64?: string) {
    const ai = this.getClient();
    const config = { 
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      config: { resolution: '720p', aspectRatio: '16:9' }
    } as any;

    if (imageBase64) {
      config.image = {
        imageBytes: imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64,
        mimeType: 'image/png'
      };
    }

    let op = await ai.models.generateVideos(config);
    while (!op.done) {
      await new Promise(r => setTimeout(r, 8000));
      op = await ai.operations.getVideosOperation({ operation: op });
    }

    const link = op.response?.generatedVideos?.[0]?.video?.uri;
    const res = await fetch(`${link}&key=${process.env.API_KEY}`);
    const blob = await res.blob();
    return new Promise<string>(r => {
      const reader = new FileReader();
      reader.onloadend = () => r(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }
}
