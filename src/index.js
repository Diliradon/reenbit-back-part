import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import authRouter from './routes/auth.route.js'
import usersRouter from './routes/users.route.js'
import messageRouter from './routes/message.route.js'
import { connectDB } from './utils/db.js'
import { handleSocketConnection } from './socket/socket.handlers.js'
import cors from 'cors'

const PORT = process.env.PORT || 3000
const CLIENT_HOST = process.env.CLIENT_HOST

const app = express()
const server = createServer(app)

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: CLIENT_HOST,
    credentials: true,
    methods: ['GET', 'POST']
  }
})

app.use(express.json())

app.use(cors({
  origin: CLIENT_HOST,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/messages', messageRouter)

app.get('/', (req, res) => {
  res.send('Hello World - Socket.IO Chat Server')
})

// Initialize Socket.IO handlers
handleSocketConnection(io)

// Connect to database before starting the server
connectDB().then(() => {
  server.listen(PORT)
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
      console.log(`🚀 Server is running on port ${PORT}`)
      console.log(`📡 Socket.IO server ready for real-time messaging`)
    })
}).catch(error => {
  console.error('Failed to connect to database:', error)
  process.exit(1)
})
