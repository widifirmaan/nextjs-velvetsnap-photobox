import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, unlink, mkdtemp } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

async function captureViaGphoto2(): Promise<string> {
  const tmpDir = await mkdtemp(join(tmpdir(), 'vs-'));
  const filePath = join(tmpDir, 'capture.jpg');
  try {
    await execAsync(`gphoto2 --capture-image-and-download --filename "${filePath}"`, { timeout: 30000 });
    const buffer = await readFile(filePath);
    const base64 = buffer.toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } finally {
    try { await unlink(filePath).catch(() => {}); } catch {}
    try { await execAsync(`rmdir "${tmpDir}"`).catch(() => {}); } catch {}
  }
}

async function captureViaDigiCamControl(): Promise<string> {
  const res = await fetch('http://127.0.0.1:5513/capture', { method: 'POST', signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`DigiCamControl error: ${res.status}`);
  const imgRes = await fetch('http://127.0.0.1:5513/image/latest');
  if (!imgRes.ok) throw new Error('Failed to fetch latest image from DigiCamControl');
  const buffer = Buffer.from(await imgRes.arrayBuffer());
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

export async function POST() {
  try {
    let dataUrl: string | null = null;
    let errors: string[] = [];

    // Try gphoto2 first
    try {
      dataUrl = await captureViaGphoto2();
    } catch (e: any) {
      errors.push(`gphoto2: ${e.message}`);
    }

    // Try DigiCamControl next
    if (!dataUrl) {
      try {
        dataUrl = await captureViaDigiCamControl();
      } catch (e: any) {
        errors.push(`DigiCamControl: ${e.message}`);
      }
    }

    if (!dataUrl) {
      return NextResponse.json({
        success: false,
        error: 'No camera driver available',
        details: errors,
      }, { status: 503 });
    }

    return NextResponse.json({ success: true, dataUrl });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
