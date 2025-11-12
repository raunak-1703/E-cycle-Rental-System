import mongoose from 'mongoose';

const DockSchema = new mongoose.Schema({
  dockId: { type: String, required: true },
  bikeId: { type: String, default: null }
}, { _id: false });

const StationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  totalDocks: { type: Number, required: true },
  availableBikes: { type: Number, default: 0 },
  docks: [DockSchema]
}, { _id: false, timestamps: true });

export default mongoose.models.Station || mongoose.model('Station', StationSchema);
