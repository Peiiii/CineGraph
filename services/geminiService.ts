
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
        type: { type: Type.STRING, enum: ["character", "scene", "script"], description: "资产类型。创建角色时请务必使用 'character'。" },
        title: { type: Type.STRING, description: "资产标题。" },
        content: { type: Type.STRING, description: "详细的文字内容，支持 Markdown。如果是角色，请包含‘核心档案’和‘详细设定’。" }
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
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: `你是一位全能的 AI 电影导演。你的目标是通过调用工具来协助用户进行电影全流程创作。
        工作流建议：1. 角色与设定 2. 剧本 3. 分镜 4. 动态。
        关于角色：当你被要求创建或设定一个角色时，请调用 write_creative_asset 并将 type 设为 'character'。请确保角色档案结构清晰、有深度。
        当前工作区资产：${JSON.stringify(contextAssets.map(a => ({id: a.id, type: a.type, title: a.title})))}。
        请保持回复简洁专业，并直接开始流式输出。`,
        tools: [{ functionDeclarations: filmTools }],
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
  }

  static async generateImage(prompt: string) {
    const ai = this.getClient();
    // Using recommended contents format for multimodal/generation tasks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] }
    });
    
    let base64 = "";
    // Iterating through all parts to find the image part as recommended
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          base64 = part.inlineData.data;
          break;
        }
      }
    }
    
    if (!base64) throw new Error("Image generation failed");
    return `data:image/png;base64,${base64}`;
  }

  static async generateVideo(prompt: string, imageBase64?: string) {
    const ai = this.getClient();
    // Setting up video parameters according to Veo guidelines
    const params: any = { 
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      config: { 
        numberOfVideos: 1, // Required by Veo guidelines
        resolution: '720p', 
        aspectRatio: '16:9' 
      }
    };

    if (imageBase64) {
      params.image = {
        imageBytes: imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64,
        mimeType: 'image/png'
      };
    }

    let op = await ai.models.generateVideos(params);
    while (!op.done) {
      await new Promise(r => setTimeout(r, 8000));
      op = await ai.operations.getVideosOperation({ operation: op });
    }

    const link = op.response?.generatedVideos?.[0]?.video?.uri;
    // Appending API key to download link as required
    const res = await fetch(`${link}&key=${process.env.API_KEY}`);
    const blob = await res.blob();
    return new Promise<string>(r => {
      const reader = new FileReader();
      reader.onloadend = () => r(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }
}
