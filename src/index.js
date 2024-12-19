import 'dotenv/config'
import express from 'express'
import authRouter from './routes/auth.route.js'
import { connectDB } from './utils/db.js'

const PORT = process.env.PORT || 3000

const app = express()

app.use(express.json())

app.use('/auth', authRouter)

app.get('/', (req, res) => {
  res.send('Hello World')
})

// Connect to database before starting the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}).catch(error => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
