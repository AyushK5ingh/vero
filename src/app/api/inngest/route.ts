import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { bedrockGenerateFunction } from "../../../inngest/bedrock-function";
import { codeAgentFunction } from "../../../inngest/function";

const handler = serve({
  client: inngest,
  functions: [codeAgentFunction, bedrockGenerateFunction],
});

export const GET = handler.GET;
export const POST = handler.POST;
