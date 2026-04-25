"use server";

import OpenAI from "openai";
import {
  getAuthorizationHeaderValue,
  getModelProviderConfig,
} from "@/lib/model-provider";

export async function askAI(systemPrompt: string, userQuery: string) {
  const config = getModelProviderConfig();

  try {
    const client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      defaultHeaders: {
        Authorization: getAuthorizationHeaderValue(config.apiKey),
      },
    });

    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuery },
      ],
      temperature: 1,
      top_p: 1,
      model: config.model,
    });

    const content = response.choices[0]?.message?.content ?? "";
    console.log("AI Response:", content);

    return {
      message: content,
    };
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
}
