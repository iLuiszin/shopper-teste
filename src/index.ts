import express, { Express } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import 'dotenv/config'

// Routes
import ReadingRoutes from './routes/ReadingRoutes'

const app: Express = express()

app.use(cors())
app.use(morgan('dev'))
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))

app.use('/api', ReadingRoutes)


const PORT = process.env.PORT || 80

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
