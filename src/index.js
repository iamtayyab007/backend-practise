//require("dotenv").config({path:'./env'});
import dotenv from "dotenv";

import connectDB from "./db/index.js";

dotenv.config({path: "./env"});

connectDB();

/*
const app = express();

async function connectDB() {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", () => {
      console.log("Error:", error);
    });
    app.listen(process.env.PORT, () => {
      console.log(`This app is listening on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error found :", error);
    throw err;
  }
}

connectDB();

*/
