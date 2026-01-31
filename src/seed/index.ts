// src/seed/index.ts
import mongoose from "mongoose";
import "dotenv/config";
import { seedDefaultAdmin } from "./seed.admin";
import dotenv from "dotenv";

dotenv.config();

async function runSeed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("Connected to MongoDB → starting seed...");

    await seedDefaultAdmin();

    console.log("Seeding completed successfully");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

runSeed();
