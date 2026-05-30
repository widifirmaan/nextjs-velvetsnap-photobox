import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  sessionId: string;
  templateId: string;
  price: number;
  status: 'PENDING' | 'PAID' | 'COMPLETED';
  photoUrls: string[]; 
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  sessionId: { type: String, required: true },
  templateId: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'PAID', 'COMPLETED'], default: 'PENDING' },
  photoUrls: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
