import { redirect } from 'next/navigation';

export default async function Page() {
  const base = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : 'http://localhost:3000';
  try {
    const res = await fetch(`${base}/api/settings`, { cache: 'no-store' });
    const data = await res.json();
    const theme = data.data?.uiTheme === 'v2' ? '/v2' : '/v1';
    redirect(theme);
  } catch {
    redirect('/v1');
  }
}
