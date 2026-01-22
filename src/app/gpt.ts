// "use server"
// // import { auth, clerkClient } from "@clerk/nextjs/server";
// import OpenAI from "openai";

// const token = process.env.OPENAI_API_KEY;
// const endpoint = "https://models.github.ai/inference";
// const model = "openai/gpt-4.1";

// export async function main() {

//   const client = new OpenAI({ baseURL: endpoint, apiKey: token });

//   const response = await client.chat.completions.create({
//     messages: [
//         { role:"system", content: systemPrompt },
//         { role:"user", content: userQuery }
//       ],
//       temperature: 1.0,
//       top_p: 1.0,
//       model: model
//     });

//   console.log(response.choices[0].message.content);
//   return {
//     message : response.choices[0].message.content,
//   };

//   // const { userId } = await auth()
//   //     if (!userId) {
//   //          return;
//   //     }
//   //     console.log(userId)
//   //   const user = await clerkClient.users.getUser(userId)
//   //   const githubTokens = await clerkClient.users.getUserOauthAccessToken(userId, "github");

//   //   console.log(user , githubTokens)
// }