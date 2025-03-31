import {Index as UpstashIndex} from '@upstash/vector'

// initialize Upstash vector client
const index = new UpstashIndex()

// create a unique namespace, this time using the user id
//index.namespace('dvuwy12g')

// create a query
export const queryMovies = async ({
    query,
    filters,
    topK = 5, // top 5 most related relative to metric

}:{ 
    query: string,
    filters?: any,
    topK?: number,
}) => {
    // loop through all filters and convert to stringse

    // create query
    return index.query({
        data: query,
        topK,
        includeData: true,
        includeMetadata: true,
    })
}