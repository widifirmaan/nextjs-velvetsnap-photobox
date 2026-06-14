import styles from './admin-section-title.module.css';
import type { LucideIcon } from 'lucide-react';

interface Props {
  icon?: LucideIcon;
  title: string;
}

export default function AdminSectionTitle({ icon: Icon, title }: Props) {
  return (
    <h2 className={styles.sectionTitle}>
      {Icon && <Icon size={18} className="flex-shrink-0" />}
      {title}
    </h2>
  );
}
