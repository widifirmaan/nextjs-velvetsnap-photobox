import mongoose, { Schema, Document } from 'mongoose';

export interface IDevice extends Document {
  deviceId: string;
  name: string;
  location: string;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
  lastPing: Date;
}

const DeviceSchema = new Schema<IDevice>({
  deviceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  status: { type: String, enum: ['ONLINE', 'OFFLINE', 'MAINTENANCE'], default: 'OFFLINE' },
  lastPing: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.Device || mongoose.model<IDevice>('Device', DeviceSchema);
