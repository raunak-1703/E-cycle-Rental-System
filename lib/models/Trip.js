import mongoose from 'mongoose';

const TripSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true },
  bikeId: { type: String, required: true },
  startStation: { type: String, required: true },
  endStation: { type: String, default: null },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, default: null },
  distanceKm: { type: Number, default: 0 },
  fare: { type: Number, default: 0 },
  status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' }
}, { _id: false, timestamps: true });

export default mongoose.models.Trip || mongoose.model('Trip', TripSchema);
