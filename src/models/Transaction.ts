// File: src/models/Transaction.ts
// Description: Auto-added top comment for easier file identification.

import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  sessionId: string;
  templateId: string;
  price: number;
  status: 'PENDING' | 'PAID' | 'COMPLETED';
  captures: string[];
  finalImage: string;
  showInCarousel: boolean;
  accountId?: string | null;
  orderId?: string;
  midtransTransactionId?: string;
  midtransStatus?: string;
  paymentMethod?: string;
  qrCodeUrl?: string;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  sessionId: { type: String, required: true },
  templateId: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'PAID', 'COMPLETED'], default: 'PENDING' },
  captures: { type: [String], default: [] },
  finalImage: { type: String, default: '' },
  showInCarousel: { type: Boolean, default: false },
  accountId: { type: String, default: null, index: true },
  orderId: { type: String, default: null },
  midtransTransactionId: { type: String, default: null },
  midtransStatus: { type: String, default: null },
  paymentMethod: { type: String, default: null },
  qrCodeUrl: { type: String, default: null },
}, { timestamps: true });

TransactionSchema.index({ sessionId: 1 }, { unique: true });
TransactionSchema.index({ orderId: 1 }, { sparse: true });
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
