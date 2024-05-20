//require("dotenv").config({path:'./env'});
import dotenv from "dotenv";
import {app} from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({path: "./env"});

const handlePort = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.on("error", () => {
      console.log("Error:", error);
    });
    app.listen(handlePort, () => {
      console.log(`server is listening at ${handlePort}`);
    });
  })
  .catch((error) => {
    console.log("There is an error connecting to mongodb:", error);
  });

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
