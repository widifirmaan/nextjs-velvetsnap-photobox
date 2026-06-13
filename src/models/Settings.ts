import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  appName: string;
  appTagline: string;
  heroTitle: string;
  heroSubtitle: string;
  logo: string;
  header: { location: string; navItems: string };
  footer: { text: string };
  system: { primaryColor: string; accentColor: string; showPreloader: boolean; showStrips: boolean; slideshowInterval: number; sessionTimer: number };
  security: { password: string; passwordSalt: string; session: string; sessionExpires: Date | null };
}

const SettingsSchema = new Schema<ISettings>({
  appName: { type: String, default: 'VelvetSnap' },
  appTagline: { type: String, default: 'AI-Powered Photobooth Experience' },
  heroTitle: { type: String, default: 'Abadikan Momen Spesialmu' },
  heroSubtitle: { type: String, default: 'Pilih frame, foto, edit, dan dapatkan hasil cetakan berkualitas tinggi dalam hitungan menit' },
  logo: { type: String, default: '' },
  header: {
    type: {
      location: { type: String, default: 'Jakarta' },
      navItems: { type: String, default: '[{"label":"Instagram","url":"https://instagram.com"},{"label":"WhatsApp","url":"https://wa.me/628123456789"},{"label":"Templates","url":"/templates"},{"label":"Studio","url":"/strips-studio"}]' },
    },
    default: {},
  },
  footer: {
    type: {
      text: { type: String, default: 'VelvetSnap Photobooth Platform' },
    },
    default: {},
  },
  system: {
    type: {
      primaryColor: { type: String, default: '#262626' },
      accentColor: { type: String, default: '#C5D89D' },
      showPreloader: { type: Boolean, default: true },
      showStrips: { type: Boolean, default: true },
      slideshowInterval: { type: Number, default: 3000 },
      sessionTimer: { type: Number, default: 600 },
    },
    default: {},
  },
  security: {
    type: {
      password: { type: String, default: '' },
      passwordSalt: { type: String, default: '' },
      session: { type: String, default: '' },
      sessionExpires: { type: Date, default: null },
    },
    default: {},
  },
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
