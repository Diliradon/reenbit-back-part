import express from 'express'
import { usersController } from '../controllers/users.controller.js'

const usersRouter = express.Router()

usersRouter.get('/', usersController.getAllUsers)

export default usersRouter 