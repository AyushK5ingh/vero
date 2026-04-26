"use server";

import { generateBedrockText } from "@/lib/bedrock-client";

export async function askAI(systemPrompt: string, userQuery: string) {
  try {
    const response = await generateBedrockText({
      prompt: userQuery,
      systemPrompt,
      temperature: 0.2,
      maxTokens: 1024,
    });

    const content = response.text;
    console.log("AI Response:", content);

    return {
      message: content,
    };
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
}
