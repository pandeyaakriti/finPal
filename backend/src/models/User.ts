import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  googleId?: string;
}

const userSchema = new mongoose.Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
});

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
