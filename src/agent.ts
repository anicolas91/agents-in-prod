import { addMessages, getMessages, saveToolResponse } from './memory'
import { runApprovalCheck, runLLM } from './llm'
import { showLoader, logMessage } from './ui'
import { runTool } from './toolRunner'
import type { AIMessage } from '../types'
import { generateImageToolDefinition } from './tools/generateImage'

const handleImageApprovalFlow = async (
  history: AIMessage[],
  userMessage: string,
) => {
  const lastMessage = history.at(-1)
  const toolCall = lastMessage?.tool_calls?.[0]

  // check if it called the correct tool, if not just return 0
  if (
    !toolCall || 
    toolCall.function.name !== generateImageToolDefinition.name
  ) {
    return false
  }

  //show loader and approval message
  const loader = showLoader('Processing approval...')
  const approved = await runApprovalCheck(userMessage)

  // run tool if approved, else dont
  if (approved) {
    loader.update(`executing tool ${toolCall.function.name}`)
    const toolResponse = await runTool(toolCall,userMessage)
    loader.update(`done: ${toolCall.function.name}`)

    await saveToolResponse(toolCall.id,toolResponse)
  } else {
    await saveToolResponse(toolCall.id,'user did not approve img generation at this time.')
  }

  // run loader and return flag that it got approved
  loader.stop()
  return true

}

export const runAgent = async ({
  userMessage,
  tools,
}: {
  userMessage: string
  tools: any[]
}) => {
  // get convo history and see given the latest msg if you got approval or not
  const history = await getMessages()
  const isImageApproval = await handleImageApprovalFlow(history,userMessage)

  // now make a conditional wether to addmessages or not, given that the tool actually got queried
  if (!isImageApproval) {
    await addMessages([{ role: 'user', content: userMessage }])
  }
  
  const loader = showLoader('🤔')

  while (true) {
    const history = await getMessages()
    const response = await runLLM({ messages: history, tools })

    await addMessages([response])

    if (response.content) {
      loader.stop()
      logMessage(response)
      return getMessages()
    }

    if (response.tool_calls) {
      // write out what tool youre about to run
      const toolCall = response.tool_calls[0]
      logMessage(response)
      loader.update(`executing: ${toolCall.function.name}`)

      // stop until you get an approval
      if (toolCall.function.name === generateImageToolDefinition.name) {
        loader.update('need user approval')
        loader.stop()
        return getMessages()
      }
      // run the tool
      const toolResponse = await runTool(toolCall, userMessage)
      await saveToolResponse(toolCall.id, toolResponse)
      loader.update(`done: ${toolCall.function.name}`)
    }
  }
}
