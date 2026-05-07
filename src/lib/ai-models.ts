import { PROMPT } from "@/inngest/prompt"

export const getAIModels = () => {
    return [
        {
            id : '1',
            name:"gpt-4o mini",
            model : 'openai/gpt-4o mini',
            maxTokens : 4091,
            outputTokens : 111111,
            prompt : PROMPT
        },
        {
            id : '2',
            name:'gpt-5',
            model : 'openai/gpt-5',
            maxTokens: 3000,
            outputTokens:20000,
            prompt : PROMPT
        },
        {
            id:'3',
            name:'gpt-4o',
            model:'openai/gpt-4o',
            maxTokens: 4561,
            outputTokens:21563,
            prompt : PROMPT
        },
        {
            id:'4',
            name:'xai/',
            maxTokens : 4091,
            outputTokens : 111111,
            prompt : PROMPT
        }
    ]
}