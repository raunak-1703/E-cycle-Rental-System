import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  wallet: { type: Number, default: 100 },
  idCardNumber: { type: String },
  activeTripId: { type: String, default: null }
}, { _id: false, timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
