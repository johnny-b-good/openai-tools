import z from "zod";
import * as fs from "node:fs";
import * as path from "node:path";

import { StandaloneTool } from "./StandaloneTool";
import { openai } from "../../consts";
import { config } from "../../utils";

export const readImageFile = new StandaloneTool({
  name: "read_image_file",
  description:
    "Analyzes an image file using a multimodal AI model. You can ask the model to describe the image, extract text (OCR), identify objects, or answer any question about the visual content.",
  zodSchema: z.object({
    imagePath: z
      .string()
      .describe("Path to the image file, relative to the working directory."),
    prompt: z
      .string()
      .describe(
        "Your question or instruction for analyzing the image. Be specific — describe what you want to know about the image content.",
      ),
  }),
  toolFunction: async ({ imagePath, prompt }) => {
    const fullPath = path.resolve(process.cwd(), imagePath);

    if (!fs.existsSync(fullPath)) {
      return `Image file not found: ${fullPath}`;
    }

    const stat = fs.statSync(fullPath);
    if (!stat.isFile()) {
      return `Path is not a file: ${fullPath}`;
    }

    try {
      const imageBuffer = fs.readFileSync(fullPath);
      const extension = path.extname(fullPath).toLowerCase();

      let mimeType: string;

      if ([".jpg", ".jpeg"].includes(extension)) {
        mimeType = "image/jpeg";
      } else if (extension === ".png") {
        mimeType = "image/png";
      } else if (extension === ".gif") {
        mimeType = "image/gif";
      } else {
        return "Unsupported file format";
      }

      const base64Image = imageBuffer.toString("base64");

      const dataUrl = `data:${mimeType};base64,${base64Image}`;

      const response = await openai.chat.completions.create({
        model: config.OPENAI_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: dataUrl },
              },
            ],
          },
        ],
      });

      const resultText =
        response.choices[0]?.message?.content || "(No response from model)";

      return resultText;
    } catch (error) {
      if (error instanceof Error) {
        return `Error analyzing image: ${error.message}`;
      }
      return "Unknown error occurred while analyzing the image";
    }
  },
});
