"use server";

import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env.GITHUB_TOKEN!;
const endpoint = "https://models.github.ai/inference";
const model = "phi-3-mini-4k-instruct";




export async function askAI(systemPrompt: string, userQuery: string) {
  try {
    const client = ModelClient(
      endpoint,
      new AzureKeyCredential(token),
    );

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userQuery }
        ],
        temperature: 1,
        top_p: 1,
        model: model
      }
    });

    if (isUnexpected(response)) {
      throw response.body.error;
    }

    const content = response.body.choices[0].message.content;
    console.log("AI Response:", content);
    
    return {
      message: content,
    };
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
}