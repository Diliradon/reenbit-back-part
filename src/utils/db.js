import "dotenv/config";
import { Sequelize } from "sequelize";

export const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  dialect: "postgres",
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
    await sequelize.sync();
    console.log("Database synchronized");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};
