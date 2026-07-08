// File: src/app/(themes)/v2/homepage/NewspaperSection.tsx
// Description: Auto-added top comment for easier file identification.

import styles from '../page.module.css';

export default function NewspaperSection({ label, children, labelClass }: {
  label?: string; children: React.ReactNode; labelClass?: string;
}) {
  return (
    <div className={styles.leadStory}>
      {label && <div className={labelClass || styles.leadStoryLabel}>{label}</div>}
      {children}
    </div>
  );
}
