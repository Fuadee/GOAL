import { GOAL_VISION_BUCKET } from './types';

const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function ensureEnv() {
  if (!baseUrl || !serviceRoleKey) {
    throw new Error('Supabase environment variables are missing.');
  }
}

export function getGoalVisionPublicUrl(imagePath: string) {
  if (!baseUrl) return '';
  return `${baseUrl}/storage/v1/object/public/${GOAL_VISION_BUCKET}/${imagePath}`;
}

export async function uploadGoalVisionFile(imagePath: string, file: File) {
  ensureEnv();

  const uploadUrl = `${baseUrl}/storage/v1/object/${GOAL_VISION_BUCKET}/${imagePath}`;
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey as string,
      Authorization: `Bearer ${serviceRoleKey as string}`,
      'Content-Type': file.type || 'application/octet-stream',
      'x-upsert': 'true'
    },
    body: Buffer.from(await file.arrayBuffer())
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Goal vision upload failed (${response.status}): ${text}`);
  }
}

export async function removeGoalVisionFile(imagePath: string) {
  ensureEnv();

  const response = await fetch(`${baseUrl}/storage/v1/object/${GOAL_VISION_BUCKET}/${imagePath}`, {
    method: 'DELETE',
    headers: {
      apikey: serviceRoleKey as string,
      Authorization: `Bearer ${serviceRoleKey as string}`
    }
  });

  if (!response.ok && response.status !== 404) {
    const text = await response.text();
    throw new Error(`Goal vision removal failed (${response.status}): ${text}`);
  }
}
