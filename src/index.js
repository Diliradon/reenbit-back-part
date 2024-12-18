import 'dotenv/config'
import express from 'express'
import { authRouter } from './routes/auth.route.js'

const PORT = process.env.PORT || 3000

const app = express()

app.use('/auth', authRouter)

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
