'use client';

import dynamic from 'next/dynamic';

const StripsStudioPage = dynamic(
  () => import('@/app/main/template-studio/page'),
  { ssr: false }
);

export default function AdminTemplateStudio() {
  return <StripsStudioPage />;
}
