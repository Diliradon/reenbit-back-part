import 'dotenv/config'
import express from 'express'
import authRouter from './routes/auth.route.js'
import { connectDB } from './utils/db.js'
import cors from 'cors'

const PORT = process.env.PORT || 3000
const CLIENT_HOST = process.env.CLIENT_HOST

const app = express()

app.use(express.json())

app.use(cors({
  origin: CLIENT_HOST,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use('/auth', authRouter)

app.get('/', (req, res) => {
  res.send('Hello World')
})

// Connect to database before starting the server
connectDB().then(() => {
  const server = app.listen(PORT)
    .on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please try another port.`)
        process.exit(1)
      } else {
        console.error('Failed to start server:', error)
        process.exit(1)
      }
    })
    .on('listening', () => {
      console.log(`Server is running on port ${PORT}`)
    })
}).catch(error => {
  console.error('Failed to connect to database:', error)
  process.exit(1)
})
