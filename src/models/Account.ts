import mongoose, { Schema, Document } from 'mongoose';

export interface IAccount extends Document {
  username: string;
  password: string;
  passwordSalt: string;
  session: string;
  settings: {
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
  };
}

const AccountSchema = new Schema<IAccount>({
  username: { type: String, required: true, unique: true },
  password: { type: String, default: '' },
  passwordSalt: { type: String, default: '' },
  session: { type: String, default: '' },
  settings: {
    type: {
      appName: { type: String, default: 'VelvetSnap' },
      appTagline: { type: String, default: 'AI-Powered Photobooth Experience' },
      heroSubtitle: { type: String, default: 'Pilih frame, foto, edit, dan dapatkan hasil cetakan berkualitas tinggi dalam hitungan menit' },
      logo: { type: String, default: '' },
      cardSmallHtml: { type: String, default: '' },
      cardPromoHtml: { type: String, default: '' },
      slideshowImages: { type: [String], default: [] },
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
    },
    default: {},
  },
}, { timestamps: true });

export default mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema);
