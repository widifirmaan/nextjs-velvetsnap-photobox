import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  appName: string;
  appTagline: string;
  heroSubtitle: string;
  logo: string;
  cardSmallHtml: string;
  cardPromoHtml: string;
  slideshowImages: string[];
  header: { location: string; navItems: string };
  footer: { text: string };
  system: { primaryColor: string; accentColor: string; showPreloader: boolean; showStrips: boolean; slideshowInterval: number; sessionTimer: number };
  security: { password: string; passwordSalt: string; session: string };
}

const SettingsSchema = new Schema<ISettings>({
  appName: { type: String, default: 'VelvetSnap' },
  appTagline: { type: String, default: 'AI-Powered Photobooth Experience' },
  heroSubtitle: { type: String, default: 'Pilih frame, foto, edit, dan dapatkan hasil cetakan berkualitas tinggi dalam hitungan menit' },
  logo: { type: String, default: '' },
  cardSmallHtml: { type: String, default: '' },
  cardPromoHtml: { type: String, default: '' },
  slideshowImages: { type: [String], default: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&q=80',
  ] },
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
      password: { type: String, default: '', select: false },
      passwordSalt: { type: String, default: '', select: false },
      session: { type: String, default: '', select: false },
    },
    default: {},
  },
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
