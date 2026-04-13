import { NextRequest, NextResponse } from 'next/server';

import {
  createPersonalTrait,
  deletePersonalTrait,
  listPersonalTraits,
  togglePersonalTraitActive,
  updatePersonalTrait
} from '@/lib/personal-traits/service';

export async function GET() {
  try {
    const traits = await listPersonalTraits();
    return NextResponse.json({ success: true, data: traits });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Unable to load personal traits.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { title?: string; description?: string; sort_order?: number };
    const title = String(body.title ?? '').trim();
    const description = String(body.description ?? '').trim() || null;
    const sortOrder = Number.isFinite(body.sort_order) ? Number(body.sort_order) : 0;

    if (!title) {
      return NextResponse.json({ success: false, message: 'Title is required.' }, { status: 400 });
    }

    const created = await createPersonalTrait({
      title: title.toUpperCase(),
      description,
      is_active: true,
      sort_order: sortOrder
    });

    if (!created) {
      return NextResponse.json({ success: false, message: 'Unable to save personal trait.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Unable to create personal trait.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      id?: string;
      mode?: 'toggle' | 'update';
      title?: string;
      description?: string | null;
      is_active?: boolean;
      sort_order?: number;
    };

    const id = String(body.id ?? '').trim();
    if (!id) return NextResponse.json({ success: false, message: 'Trait id is required.' }, { status: 400 });

    if (body.mode === 'toggle') {
      const toggled = await togglePersonalTraitActive(id);
      if (!toggled) return NextResponse.json({ success: false, message: 'Trait not found.' }, { status: 404 });
      return NextResponse.json({ success: true, data: toggled });
    }

    const payload = {
      title: typeof body.title === 'string' ? body.title.trim().toUpperCase() : undefined,
      description: body.description === null ? null : typeof body.description === 'string' ? body.description.trim() || null : undefined,
      is_active: typeof body.is_active === 'boolean' ? body.is_active : undefined,
      sort_order: typeof body.sort_order === 'number' ? body.sort_order : undefined
    };

    const updated = await updatePersonalTrait(id, payload);
    if (!updated) return NextResponse.json({ success: false, message: 'Trait not found.' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Unable to update personal trait.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json()) as { id?: string };
    const id = String(body.id ?? '').trim();
    if (!id) return NextResponse.json({ success: false, message: 'Trait id is required.' }, { status: 400 });

    await deletePersonalTrait(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Unable to delete personal trait.' }, { status: 500 });
  }
}
