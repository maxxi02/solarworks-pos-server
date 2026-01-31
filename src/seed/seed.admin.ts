import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { connectDatabase } from "../config/database";

const DEFAULT_ADMIN = {
  name: process.env.ADMIN_USERNAME as string,
  email: process.env.ADMIN_EMAIL as string,
  password: process.env.ADMIN_PASSWORD as string,
  role: "admin",
};

export async function seedDefaultAdmin() {
  try {
    await connectDatabase();
    const existingAdmin = await User.findOne({ email: DEFAULT_ADMIN.email });

    if (existingAdmin) {
      console.log("Default admin already exists → skipping seed");
      return;
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 12);

    const admin = new User({
      name: DEFAULT_ADMIN.name,
      email: DEFAULT_ADMIN.email,
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();

    console.log("Default admin created successfully");
    console.log(`Email    : ${admin.email}`);
    console.log(`Password : ${DEFAULT_ADMIN.password}  (change immediately!)`);
  } catch (err) {
    console.error("Error seeding default admin:", err);
  }
}
