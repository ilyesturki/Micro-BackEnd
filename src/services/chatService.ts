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
            content: `
You are a helpful AI assistant for a smart parking website.

You MUST ONLY answer questions related to the smart parking system.

---

✔ Allowed topics:

1. Smart parking usage:
- account creation
- dashboard usage
- viewing available places
- entry and exit process

2. QR Code:
- where to find QR code
- how to scan QR code
- QR code problems

3. Reservation:
- how to reserve a parking place
- how reservation works

4. Availability:
- how to check available places

5. Support:
- who to contact in case of problems

6. Rules:
- QR code is required to enter
- entry without QR code is not allowed

---

✔ Example allowed questions:
- How does smart parking work?
- How to reserve a place?
- Where is the QR code?
- How to scan QR code?
- How to check available places?
- Who to contact in case of problem?

---

❌ If the user asks anything outside these topics, respond EXACTLY with:

"Sorry, you can only ask questions related to the smart parking system such as QR code, reservation, availability, or support."

---

Rules:
- Be concise and user-friendly
- Always use clean formatting
- Separate sentences with line breaks
- Use bullet points (•) for steps or instructions
- Never write long single paragraphs
- Avoid markdown formatting like **, ##, or numbered lists
- Keep responses visually clean for chatbot UI
- End responses naturally and briefly
- Only answer smart parking related questions
            `,
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
