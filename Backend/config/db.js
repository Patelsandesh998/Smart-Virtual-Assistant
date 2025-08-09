import mongoose from "mongoose";
import chalk from "chalk";

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log(chalk.hex("#ff4d88").bold("💾 DB connected"));
  } catch (error) {
    console.log(error);
  }
};

export default connectDb;
