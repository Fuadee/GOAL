import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { upsertGoalVisionImage, deleteGoalVisionImageRecord } from '@/lib/goal-vision/mutations';
import { getGoalVisionImages } from '@/lib/goal-vision/queries';
import { getGoalVisionPublicUrl, removeGoalVisionFile, uploadGoalVisionFile } from '@/lib/goal-vision/storage';
import { DEFAULT_GOAL_VISION_USER_ID, GOAL_VISION_KEYS, GoalVisionKey } from '@/lib/goal-vision/types';

const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']);
const MAX_BYTES = 8 * 1024 * 1024;

function isGoalVisionKey(value: string): value is GoalVisionKey {
  return GOAL_VISION_KEYS.includes(value as GoalVisionKey);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const goalKeyRaw = String(formData.get('goalKey') ?? '').trim();
    const userId = String(formData.get('userId') ?? DEFAULT_GOAL_VISION_USER_ID).trim() || DEFAULT_GOAL_VISION_USER_ID;
    const file = formData.get('file');

    if (!isGoalVisionKey(goalKeyRaw)) {
      return NextResponse.json({ success: false, message: 'Invalid goal key.' }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, message: 'Image file is required.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ success: false, message: 'Only image files are allowed.' }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, message: 'Image must be 8MB or less.' }, { status: 400 });
    }

    const existingRows = await getGoalVisionImages(userId);
    const existing = existingRows.find((row) => row.goal_key === goalKeyRaw);

    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const imagePath = `${userId}/${goalKeyRaw}/${randomUUID()}.${extension}`;

    await uploadGoalVisionFile(imagePath, file);
    const upserted = await upsertGoalVisionImage({ user_id: userId, goal_key: goalKeyRaw, image_path: imagePath });

    if (!upserted) {
      return NextResponse.json({ success: false, message: 'Unable to save goal image record.' }, { status: 500 });
    }

    if (existing && existing.image_path !== imagePath) {
      await removeGoalVisionFile(existing.image_path);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...upserted,
        image_url: getGoalVisionPublicUrl(upserted.image_path)
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Upload failed. Please try again.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json()) as { goalKey?: string; userId?: string };
    const goalKeyRaw = String(body.goalKey ?? '').trim();
    const userId = String(body.userId ?? DEFAULT_GOAL_VISION_USER_ID).trim() || DEFAULT_GOAL_VISION_USER_ID;

    if (!isGoalVisionKey(goalKeyRaw)) {
      return NextResponse.json({ success: false, message: 'Invalid goal key.' }, { status: 400 });
    }

    const rows = await getGoalVisionImages(userId);
    const target = rows.find((row) => row.goal_key === goalKeyRaw);

    if (!target) {
      return NextResponse.json({ success: true });
    }

    await removeGoalVisionFile(target.image_path);
    await deleteGoalVisionImageRecord(target.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Remove failed. Please try again.' }, { status: 500 });
  }
}
