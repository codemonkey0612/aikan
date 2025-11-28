import app from "./app";
import dotenv from "dotenv";
import { connectRedis } from "./config/redis";

dotenv.config();

const PORT = process.env.PORT || 3001;

// Redis接続を確立
connectRedis().catch((error) => {
  console.error("Failed to connect to Redis:", error);
});

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});
