
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Asset } from "../types";
import { Message } from "../stores/useChatStore";

export const filmTools: FunctionDeclaration[] = [
  {
    name: "create_visual_shot",
    description: "生成全新的电影画面、分镜图片或角色视觉图。",
    parameters: {
      type: Type.OBJECT,
      properties: {
        prompt: { type: Type.STRING, description: "高度详细的视觉描述（英文更佳）。" },
        title: { type: Type.STRING, description: "资产标题。" }
      },
      required: ["prompt", "title"]
    }
  },
  {
    name: "animate_scene",
    description: "将已有的分镜或图片转化为动态视频片段。",
    parameters: {
      type: Type.OBJECT,
      properties: {
        prompt: { type: Type.STRING, description: "描述动作和镜头运动。" },
        reference_asset_id: { type: Type.STRING, description: "参考图片的 ID。" }
      },
      required: ["prompt"]
    }
  },
  {
    name: "write_creative_asset",
    description: "编写全新的剧本片段、角色档案、场景设定等文字资产。",
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, enum: ["character", "scene", "script"], description: "资产类型。" },
        title: { type: Type.STRING, description: "资产标题。" },
        content: { type: Type.STRING, description: "详细的文字内容（Markdown）。" }
      },
      required: ["type", "title", "content"]
    }
  },
  {
    name: "update_creative_asset",
    description: "修改、润色或更新画布上已有的文字、剧本或角色档案。当用户要求修改内容或根据建议调整时使用。",
    parameters: {
      type: Type.OBJECT,
      properties: {
        asset_id: { type: Type.STRING, description: "要修改的资产唯一 ID。" },
        title: { type: Type.STRING, description: "更新后的标题（如果需要更改）。" },
        content: { type: Type.STRING, description: "更新后的完整内容（Markdown）。" }
      },
      required: ["asset_id", "content"]
    }
  }
];

export class GeminiService {
  private static getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  static async chatWithAgentStream(message: string, contextAssets: Asset[], history: Message[]) {
    const ai = this.getClient();
    
    // 构建资产清单上下文
    const assetList = contextAssets.map(a => `[ID: ${a.id}] ${a.title} (${a.type})`).join('\n');

    // 将历史记录转换为 Gemini 格式
    // 注意：Gemini 要求 role 必须是 'user' 或 'model'
    const contents = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // 添加当前的最新消息
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    return ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: `你是一位全能的 AI 电影导演。
        你可以：
        1. 使用 write_creative_asset 创建新内容。
        2. 使用 update_creative_asset 修改已有内容。
        3. 使用 create_visual_shot 和 animate_scene 生成视觉效果。
        
        当前画布资产（你可以通过 ID 引用并修改它们）：
        ${assetList || '暂无资产'}
        
        重要规则：
        - 始终参考之前的对话上下文。如果用户提到“它”或“刚才的”，请根据历史记录判断其意图。
        - 当用户要求“修改”、“润色”、“调整”或“重写”某个已有的资产时，务必使用 update_creative_asset。
        - 保持专业、简洁、富有创造力。`,
        tools: [{ functionDeclarations: filmTools }],
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
  }

  static async generateImage(prompt: string) {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] }
    });
    
    let base64 = "";
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
    const params: any = { 
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
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
    const res = await fetch(`${link}&key=${process.env.API_KEY}`);
    const blob = await res.blob();
    return new Promise<string>(r => {
      const reader = new FileReader();
      reader.onloadend = () => r(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }
}
