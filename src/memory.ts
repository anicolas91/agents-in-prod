import { JSONFilePreset } from 'lowdb/node'
import type { AIMessage } from '../types'
import { v4 as uuidv4 } from 'uuid'
import { summarizeMessages } from './llm'

export type MessageWithMetadata = AIMessage & {
  id: string
  createdAt: string
}

type Data = {
  messages: MessageWithMetadata[]
  summary: string // new bit, added a type exclusive for summary
}

// fcn to add metadata on our db, formatted
export const addMetadata = (message: AIMessage) => {
  return {
    ...message,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  }
}

// fcn to remove metadata on our db, formatted
export const removeMetadata = (message: MessageWithMetadata) => {
  const { id, createdAt, ...rest } = message
  return rest
}

// fcn to initialize db essentially
const defaultData: Data = {
  messages: [],
  summary: '',
}

// fcn to extract data from db
export const getDb = async () => {
  const db = await JSONFilePreset<Data>('db.json', defaultData)
  return db
}

// fcn to add messages (metadata included) to db
export const addMessages = async (messages: AIMessage[]) => {
  const db = await getDb()
  db.data.messages.push(...messages.map(addMetadata))

  // new bit: summarize summary every 10 messages using the previous 5 messages
  if (db.data.messages.length >= 10) {
    const oldestMessages = db.data.messages.slice(0,5).map(removeMetadata) // get previous 5 messages, remove metadata
    const summary = await summarizeMessages(oldestMessages) // create a summary using LLM
    db.data.summary = summary
  }

  await db.write()
}

// fcn to retrieve messages (with metadata removed) from db
export const getMessages = async () => {
  const db = await getDb()
  const messages = await db.data.messages.map(removeMetadata)
  // extra bit, retrieve the last 5 messages only to save yourself some tokens
  const lastFive = messages.slice(-5)

  // if you happen to slice it such that the first message is a tool response, just get one more before it
  if (lastFive[0]?.role === 'tool') {
    const sixthMessage = messages[messages.length - 6]
    if (sixthMessage) {
      return [sixthMessage, ...lastFive]
    }
  }

  return lastFive

}

// fcn to save the respone of a tool into the db 
export const saveToolResponse = async (
  toolCallId: string,
  toolResponse: string
) => {
  return addMessages([
    {
      role: 'tool',
      content: toolResponse,
      tool_call_id: toolCallId,
    },
  ])
}

// fcn to get a summary out of a bunch of messages
export const getSummary = async () => {
  const db = await getDb()
  return db.data.summary

}