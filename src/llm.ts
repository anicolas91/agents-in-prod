import type { AIMessage } from '../types'
import { openai } from './ai'
import { zodFunction, zodResponseFormat } from 'openai/helpers/zod'
import { systemPrompt as defaultSystemPrompt } from './systemPrompt'
import { z } from 'zod'
import { getSummary } from './memory'

// main fcn that calls the openAI API to submit a request
export const runLLM = async ({
  messages,
  tools = [],
  temperature = 0.1,
  systemPrompt,
}: {
  messages: AIMessage[]
  tools?: any[]
  temperature?: number
  systemPrompt?: string
}) => {
  const formattedTools = tools.map(zodFunction)
  const summary = await getSummary() //new bit that gets a summary
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature,
    messages: [
      {
        role: 'system',
        content: `${systemPrompt || defaultSystemPrompt}. Conversation so far: ${summary}`, // new bit, it adds the context of summary to what the ai knows
      },
      ...messages, // new bit, these are probably truncated
    ],
    ...(formattedTools.length > 0 && {
      tools: formattedTools,
      tool_choice: 'auto',
      parallel_tool_calls: false,
    }),
  })

  return response.choices[0].message
}

// create an approval check object
 export const runApprovalCheck = async (userMessage: string) => {
  const result = await openai.beta.chat.completions.parse({
    model: 'gpt-4o-mini',
    temperature: 0.1,
    response_format: zodResponseFormat(z.object(
      {approved: z.boolean().describe('did the user approve the action or not')}
      ),
    'approval'
    ),
    messages: [
      {role:'system',content: 'Determine if the user approved the image generation. If you are not sure, then it is not approved.'},
      {role: 'user', content: userMessage}]
  })

  return result.choices[0].message.parsed?.approved

 }

 //fcn to summarize content using LLM
 export const summarizeMessages = async (messages: AIMessage[]) => {
  const response = await runLLM({
    messages,
    systemPrompt: 'Sumamrize the key points of the conversation in a concise way that would be helpful as context for future chatbot interactions. Summarize it play by play.',
    temperature: 0.3,
  })

  return response.content || ''
 }