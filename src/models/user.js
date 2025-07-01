import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pictureUrl: { type: String, default: "https://fotomhs.amikom.ac.id/2022/22_01_4800.jpg" },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String },
  position: { type: String, default: "Member" },
  number: { type: Number },
  nbm: { type: Number },
  status: { type: String, enum: [ "active", "not"], default: "active" },
  role: {
    type: String,
    enum: ["user", "admin", "superadmin"],
    default: "user",
  },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model('User', UserSchema);