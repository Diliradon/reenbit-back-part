import express from 'express'
import { usersController } from '../controllers/users.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const usersRouter = express.Router()

usersRouter.get('/', usersController.getAllUsers)
usersRouter.get('/me', authenticate, usersController.getCurrentUser)
usersRouter.get('/others', authenticate, usersController.getAllUsersExceptMe)
usersRouter.get('/:userId', usersController.getUserById)

export default usersRouter 