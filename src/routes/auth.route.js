import express from 'express'
import { authController } from '../controllers/auth.controller.js'

const authRouter = express.Router()

authRouter.post('/signup', authController.register)
authRouter.get('/activate/:token', authController.activate)

export default authRouter
