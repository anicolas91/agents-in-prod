import {Index as UpstashIndex} from '@upstash/vector'

// initialize Upstash vector client
const index = new UpstashIndex({
  url: process.env.UPSTASH_VECTOR_REST_URL as string,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN as string,
})

// create a unique namespace, this time using the user id
//index.namespace('dvuwy12g')

// create a query
export const queryMovies = async ({
    query,
    //filters,
    topK = 5, // top 5 most related relative to metric

}:{ 
    query: string,
    //filters?: any,
    topK?: number,
}) => {
    // loop through all filters and convert to stringse

    // query the vector store
    const results = await index.query({
        data: query,
        topK,
        includeData: true,
        includeMetadata: true,
    })

    return results
}