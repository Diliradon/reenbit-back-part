import 'dotenv/config'
import { connectDB } from './utils/db.js'
import { User } from './models/user.js'
import { sequelize } from './utils/db.js'

connectDB()
