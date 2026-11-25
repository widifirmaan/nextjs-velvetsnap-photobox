import { getLocalEnv } from '../../../../lib/db-adapter.mjs';
import { handleApiRequest } from '../../../../worker.js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function handler(request: Request) {
  const env = await getLocalEnv();
  return handleApiRequest(request, env);
}

export async function GET(request: Request) {
  return handler(request);
}

export async function POST(request: Request) {
  return handler(request);
}

export async function PUT(request: Request) {
  return handler(request);
}

export async function PATCH(request: Request) {
  return handler(request);
}

export async function DELETE(request: Request) {
  return handler(request);
}

export async function OPTIONS(request: Request) {
  return handler(request);
}
