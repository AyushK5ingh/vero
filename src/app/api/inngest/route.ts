import { inngest } from "../../../inngest/client"; // Adjust path if needed
import { bedrock } from '@ai-sdk/amazon-bedrock';
import { generateText } from 'ai'; 

export const bedrockGenerateFunction = inngest.createFunction(
  { 
    id: "bedrock-agent",
    // ✅ The trigger is now inside the first argument
    triggers: [{ event: "app/run-agent" }] 
  },
  // ✅ This is now the second argument, and TypeScript will correctly type 'event' and 'step'
  async ({ event, step }) => {
    
    const result = await step.run("call-llama3-on-bedrock", async () => {
      
      const { text } = await generateText({
        model: bedrock('meta.llama3-70b-instruct-v1:0'),
        prompt: "Your system prompt and user input here",
      });

      return text;
    });

    return { data: result };
  }
);