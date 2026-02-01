import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { User } from "../models/User";

const DEFAULT_ADMIN = {
  name: process.env.ADMIN_USERNAME as string,
  email: process.env.ADMIN_EMAIL as string,
  password: process.env.ADMIN_PASSWORD as string,
  role: "admin", // Explicitly set role
};

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined");
  }

  await mongoose.connect(mongoUri);
  console.log("✅ Connected to MongoDB");
}

export async function seedDefaultAdmin() {
  try {
    await connectDB();
    
    console.log("🔍 Checking for existing admin...");
    const existingAdmin = await User.findOne({ email: DEFAULT_ADMIN.email });

    if (existingAdmin) {
      console.log("✅ Default admin already exists");
      console.log("Admin details:", {
        id: existingAdmin._id,
        email: existingAdmin.email,
        name: existingAdmin.name,
        role: existingAdmin.role
      });
      return;
    }

    console.log("📝 Creating new admin user...");
    
    // Create admin - the password will be hashed by the pre-save hook
    const admin = await User.create({
      name: DEFAULT_ADMIN.name,
      email: DEFAULT_ADMIN.email,
      password: DEFAULT_ADMIN.password,
      role: "admin", // IMPORTANT: Set the role
    });

    console.log("✅ Default admin created successfully!");
    console.log("📧 Email    :", admin.email);
    console.log("👤 Name     :", admin.name);
    console.log("🔐 Role     :", admin.role);
    console.log("🔑 Password :", DEFAULT_ADMIN.password, "(change immediately!)");
    
  } catch (err) {
    console.error("❌ Error seeding default admin:", err);
    throw err;
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

// Run if executed directly
if (require.main === module) {
  seedDefaultAdmin()
    .then(() => {
      console.log("🎉 Seeding completed successfully");
      process.exit(0);
    })
    .catch((err) => {
      console.error("💥 Seeding failed:", err);
      process.exit(1);
    });
}