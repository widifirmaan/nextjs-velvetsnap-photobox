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
  sessionTimer: number;
  headerLocation: string;
  headerNavItems: string;
  adminPassword: string;
  adminPasswordSalt: string;
  adminSession: string;
  adminSessionExpires: Date | null;
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
  sessionTimer: { type: Number, default: 600 },
  headerLocation: { type: String, default: 'Jakarta' },
  headerNavItems: { type: String, default: '[{"label":"Instagram","url":"https://instagram.com"},{"label":"WhatsApp","url":"https://wa.me/628123456789"},{"label":"Templates","url":"/templates"},{"label":"Studio","url":"/strips-studio"}]' },
  adminPassword: { type: String, default: '' },
  adminPasswordSalt: { type: String, default: '' },
  adminSession: { type: String, default: '' },
  adminSessionExpires: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
