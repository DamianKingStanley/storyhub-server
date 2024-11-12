import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import userRoute from "./routes/userRoute.js";
import storyRoute from "./routes/storyRoute.js";
import chapterRoute from "./routes/chapterRoute.js";
// import commentRoute from "./routes/commentRoute.js";
import libraryRoute from "./routes/libraryRoute.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
dotenv.config();

// middlewares
app.use(morgan("dev"));
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGODB_URL = process.env.MONGODB_URL;

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URL);
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

startServer();

app.get("/", (req, res) => {
  res.json({ message: "Welcome" });
});

// Serve static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.use("/", commentRoute);
app.use("/", userRoute);
app.use("/", storyRoute);
app.use("/", chapterRoute);
app.use("/", libraryRoute);
