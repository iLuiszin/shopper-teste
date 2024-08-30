import express, { Express } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'
import fs from 'fs'
import 'dotenv/config'

process.env.DATABASE_URL_TEST = 'file:./test.db'
process.env.DATABASE_URL = 'file:./dev.db'

// Swagger config
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from './swagger/swagger-output.json'

import MeasureRoutes from './routes/MeasureRoutes'

const app: Express = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

const uploadDir = path.resolve(__dirname, 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

app.use('/uploads', express.static(uploadDir))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/', MeasureRoutes)

const PORT = process.env.PORT || 80

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
