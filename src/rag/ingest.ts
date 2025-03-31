import 'dotenv/config'
import {Index as UpstashIndex} from '@upstash/vector'
import {parse} from 'csv-parse/sync'
import fs from 'node:fs'
import path from 'node:path'
import ora from 'ora'

// initialize Upstash vector client
const index = new UpstashIndex()

// Function to index IMDB movie data
export async function indexMovieData() {
    const spinner = ora('Reading movie data...').start()
  
    // Read and parse CSV file
    const csvPath = path.join(process.cwd(), 'src/rag/imdb_movie_dataset.csv')
    const csvData = fs.readFileSync(csvPath, 'utf-8')
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
    })
  
    spinner.text = 'Starting movie indexing...'
  
    // Index each movie
    for (const movie of records) {
      spinner.text = `Indexing movie: ${movie.Title}`
      const text = `${movie.Title}. ${movie.Genre}. ${movie.Description}`
  
      try {
        await index.upsert({
          id: movie.Title, // Using Rank as unique ID
          data: text, // Text will be automatically embedded
          metadata: {
            title: movie.Title,
            year: Number(movie.Year),
            genre: movie.Genre,
            director: movie.Director,
            actors: movie.Actors,
            rating: Number(movie.Rating),
            votes: Number(movie.Votes),
            revenue: Number(movie.Revenue),
            metascore: Number(movie.Metascore),
          },
        })
      } catch (error) {
        spinner.fail(`Error indexing movie ${movie.Title}`)
        console.error(error)
      }
    }
  
    spinner.succeed('Finished indexing movie data')
  }
  indexMovieData()