import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey =
      this.configService.get<string>('GEMINI_API_KEY') ||
      process.env.GEMINI_API_KEY ||
      '';
    if (!apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY is not configured in environment variables',
      );
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-embedding-001',
      });
      const result = await model.embedContent({
        content: { role: 'user', parts: [{ text }] },
        outputDimensionality: 768,
      } as any);
      return result.embedding.values;
    } catch (error) {
      this.logger.error(
        `Failed to generate embedding: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async *streamChat(
    systemInstruction: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  ): AsyncIterable<string> {
    try {
      if (!messages || messages.length === 0) {
        return;
      }

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-3.6-flash',
        systemInstruction: systemInstruction || undefined,
      });

      // Gemini API yêu cầu history phải bắt đầu bằng role 'user'
      // Bỏ qua các tin nhắn chào mừng 'assistant' ở đầu lịch sử
      const historyRaw = messages.slice(0, -1);
      const firstUserIdx = historyRaw.findIndex((m) => m.role === 'user');
      const validHistoryRaw =
        firstUserIdx !== -1 ? historyRaw.slice(firstUserIdx) : [];

      const history: Array<{
        role: 'user' | 'model';
        parts: Array<{ text: string }>;
      }> = [];

      for (const m of validHistoryRaw) {
        const role: 'user' | 'model' =
          m.role === 'assistant' ? 'model' : 'user';
        if (history.length > 0 && history[history.length - 1].role === role) {
          history[history.length - 1].parts[0].text += `\n${m.content}`;
        } else {
          history.push({
            role,
            parts: [{ text: m.content }],
          });
        }
      }

      const latestMessage = messages[messages.length - 1].content;

      const chat = model.startChat({ history });
      const resultStream = await chat.sendMessageStream(latestMessage);

      for await (const chunk of resultStream.stream) {
        const text = chunk.text();
        if (text) {
          yield text;
        }
      }
    } catch (error) {
      this.logger.error(
        `Error in Gemini streamChat: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
