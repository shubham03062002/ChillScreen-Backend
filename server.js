import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { db } from "./dbcon/db.js";
import router from "./routes/userRoute.js";
import cors from "cors";

// Load environment variables
dotenv.config();

// Connect to DB
db();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:5173",
  "https://yourfrontend.com"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Routes
app.get("/", (req, res) => res.send("API is running..."));
app.use("/api/v1/user", router);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
