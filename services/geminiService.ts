
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Asset } from "../types";

// 定义 Agent 可以使用的工具
export const filmTools: FunctionDeclaration[] = [
  {
    name: "create_visual_shot",
    description: "生成电影画面或视觉分镜。当用户想要‘看’某个画面、‘生成图片’或‘绘制场景’时使用。",
    parameters: {
      type: Type.OBJECT,
      properties: {
        prompt: { type: Type.STRING, description: "画面的视觉描述，包含构图、光影、细节。" },
        style: { type: Type.STRING, description: "画面风格，如：赛博朋克、写实、黑白电影等。" }
      },
      required: ["prompt"]
    }
  },
  {
    name: "animate_scene",
    description: "将静态画面转化为动态视频。当用户想要‘动起来’、‘生成视频’或‘制作动画’时使用。",
    parameters: {
      type: Type.OBJECT,
      properties: {
        movement_description: { type: Type.STRING, description: "镜头运动或物体动作的描述。" }
      },
      required: ["movement_description"]
    }
  },
  {
    name: "write_story_asset",
    description: "撰写角色档案、剧本片段或场景描述。当用户需要文字层面的设定时使用。",
    parameters: {
      type: Type.OBJECT,
      properties: {
        asset_type: { type: Type.STRING, enum: ["character", "scene"], description: "资产类型：角色或场景。" },
        details: { type: Type.STRING, description: "需要详细阐述的内容或要求。" }
      },
      required: ["asset_type", "details"]
    }
  }
];

export class GeminiService {
  private static getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  // 对话式 Agent 核心逻辑
  static async chatWithAgent(message: string, history: any[], contextAssets: Asset[]) {
    const ai = this.getClient();
    const chat = ai.chats.create({
      model: "gemini-3-pro-preview", // 使用更强的模型处理逻辑推理
      config: {
        systemInstruction: `你是一位全能的 AI 电影导演。你的任务是协助用户通过对话完成电影创作。
        你可以通过调用工具来：
        1. 生成视觉分镜 (create_visual_shot)
        2. 制作动态视频 (animate_scene)
        3. 编写角色设定和场景剧本 (write_story_asset)
        
        当前画布选中的上下文资产数量：${contextAssets.length}。
        如果用户提到“这个”、“它”或“基于选中的”，请参考这些上下文。
        请保持专业、富有创意且简洁。使用中文交流。`,
        tools: [{ functionDeclarations: filmTools }]
      }
    });

    const response = await chat.sendMessage({ message });
    return response;
  }

  // 工具执行函数：生图
  static async executeImageGen(prompt: string, contextAssets: Asset[]) {
    const ai = this.getClient();
    const parts: any[] = [{ text: prompt }];
    contextAssets.filter(a => a.type === 'image').forEach(asset => {
      parts.push({ inlineData: { data: asset.content.split(',')[1] || asset.content, mimeType: 'image/png' } });
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts }
    });

    const imageData = response.candidates?.[0]?.content?.parts.find(p => p.inlineData)?.inlineData?.data;
    if (!imageData) throw new Error("生图失败");
    return `data:image/png;base64,${imageData}`;
  }

  // 工具执行函数：生视频
  static async executeVideoGen(prompt: string, contextAssets: Asset[]) {
    const ai = this.getClient();
    const refImg = contextAssets.find(a => a.type === 'image');
    
    let op = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      image: refImg ? { imageBytes: refImg.content.split(',')[1], mimeType: 'image/png' } : undefined,
      config: { resolution: '720p', aspectRatio: '16:9' }
    });
    
    while (!op.done) {
      await new Promise(r => setTimeout(r, 10000));
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
