import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";

// Define the User interface
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define the User schema
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default in queries
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash if password is modified
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
