import type { ToolFn } from '../../types'
import { z } from 'zod'
import { queryMovies } from '../rag/query'


export const movieSearchToolDefinition = {
  name: 'movie_search',
  parameters: z.object({
    query: z
      .string()
      .describe(
        `query used to vector search on movies.`
      ),
  }),
  description: 'Use this tool to find movies or answer questions about movies and their metadata, like score, rating, cost, director, actors, etc.',
}

type Args = z.infer<typeof movieSearchToolDefinition.parameters>

export const movieSearch: ToolFn<Args> = async ({
  userMessage,
  toolArgs,
}) => {
  let results
  try{
    results = await queryMovies({query: toolArgs.query})
  } catch (e) {
    console.error(e)
    return 'error: could not query the db to get the movies.'
  }

  // format the results
  const formattedResults = results.map((result) =>
    {
    const {metadata,data} = result
    return {...metadata,description: data} // removes metadata
    })

  JSON.stringify(formattedResults,null,2)
}
