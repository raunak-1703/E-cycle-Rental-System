import mongoose from 'mongoose';

const ReservationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true },
  bikeId: { type: String, required: true },
  stationId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
}, { _id: false, timestamps: true });

export default mongoose.models.Reservation || mongoose.model('Reservation', ReservationSchema);
