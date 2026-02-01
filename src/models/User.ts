import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "staff"],
      default: "staff", // Default role is staff
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash if password is modified
  if (!this.isModified("password")) return next();

  // Hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
