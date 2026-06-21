import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  const cameras: { name: string; port: string }[] = [];
  const errors: string[] = [];

  try {
    const { stdout } = await execAsync('gphoto2 --auto-detect', { timeout: 10000 });
    const lines = stdout.split('\n').slice(2).filter(Boolean);
    for (const line of lines) {
      const parts = line.trim().split(/\s{2,}/);
      if (parts.length >= 2) cameras.push({ name: parts[0].trim(), port: parts[1].trim() });
    }
  } catch (e: unknown) {
    errors.push(`gphoto2: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    const res = await fetch('http://127.0.0.1:5513/camera', { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      cameras.push({ name: data?.camera || 'DigiCamControl Camera', port: 'digicamcontrol' });
    }
  } catch (e: unknown) {
    errors.push(`DigiCamControl: ${e instanceof Error ? e.message : String(e)}`);
  }

  return NextResponse.json({ success: true, cameras, errors });
}
