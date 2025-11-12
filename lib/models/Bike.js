import mongoose from 'mongoose';

const BikeSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  bikeNumber: { type: String, required: true, unique: true },
  batteryLevel: { type: Number, default: 100 },
  status: { 
    type: String, 
    enum: ['available', 'reserved', 'rented', 'maintenance'], 
    default: 'available' 
  },
  currentStation: { type: String, default: null }
}, { _id: false, timestamps: true });

export default mongoose.models.Bike || mongoose.model('Bike', BikeSchema);
