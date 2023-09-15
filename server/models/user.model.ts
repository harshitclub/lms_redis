require("dotenv").config();
import jwt from "jsonwebtoken";
import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerified: boolean;
  courses: Array<{ courseId: string }>;
  comparePassword: (password: string) => Promise<boolean>;
  signAccessToken: () => string;
  signRefreshToken: () => string;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      match: /^\S+@\S+\.\S+$/,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter the password"],
      minlength: [6, "Password must be at least 6 character long"],
      select: false,
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    courses: [
      {
        courseId: String,
      },
    ],
  },
  { timestamps: true }
);

// hash the password
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//sign access token
userSchema.methods.signAccessToken = async function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || "");
};

//sign refresh token
userSchema.methods.signRefreshToken = async function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || "");
};

//compare password
userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

const userModel: Model<IUser> = mongoose.model("User", userSchema);

export default userModel;
