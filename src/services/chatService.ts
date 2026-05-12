import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const BASE_URL = "https://models.inference.ai.azure.com";
const MODEL = "gpt-4o";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export const chatService = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { messages }: { messages: Message[] } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return next(new ApiError("Invalid messages format", 400));
    }

    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful, friendly AI assistant for this website. Answer questions clearly and concisely.",
          },
          ...messages,
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("GitHub Models error:", err);
      return next(
        new ApiError(
          err.error?.message || "GitHub Models API error",
          response.status
        )
      );
    }

    const data = await response.json();
    const reply: string = data.choices[0].message.content;
    res.status(200).json({ message: reply });
  }
);
