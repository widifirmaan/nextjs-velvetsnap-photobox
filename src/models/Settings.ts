import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  appName: string;
  appTagline: string;
  heroTitle: string;
  heroSubtitle: string;
  footerText: string;
  introCardHtml: string;
  heroCardHtml: string;
  footerHtml: string;
  primaryColor: string;
  accentColor: string;
  showPreloader: boolean;
  showStrips: boolean;
  slideshowInterval: number;
  fontFamily: string;
  headingFontFamily: string;
  headingFontSize: number;
  bodyFontSize: number;
  textAlign: string;
  sessionTimer: number;
}

const SettingsSchema = new Schema<ISettings>({
  appName: { type: String, default: 'VelvetSnap' },
  appTagline: { type: String, default: 'AI-Powered Photobooth Experience' },
  heroTitle: { type: String, default: 'Abadikan Momen Spesialmu' },
  heroSubtitle: { type: String, default: 'Pilih frame, foto, edit, dan dapatkan hasil cetakan berkualitas tinggi dalam hitungan menit' },
  footerText: { type: String, default: 'VelvetSnap Photobooth Platform' },
  introCardHtml: { type: String, default: '' },
  heroCardHtml: { type: String, default: '' },
  footerHtml: { type: String, default: '' },
  primaryColor: { type: String, default: '#262626' },
  accentColor: { type: String, default: '#C5D89D' },
  showPreloader: { type: Boolean, default: true },
  showStrips: { type: Boolean, default: true },
  slideshowInterval: { type: Number, default: 3000 },
  fontFamily: { type: String, default: '' },
  headingFontFamily: { type: String, default: '' },
  headingFontSize: { type: Number, default: 0 },
  bodyFontSize: { type: Number, default: 0 },
  textAlign: { type: String, default: '' },
  sessionTimer: { type: Number, default: 600 },
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
