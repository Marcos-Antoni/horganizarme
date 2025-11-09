import { NextResponse } from 'next/server';
import { createServerClient } from '@/db/db';

// GET: Obtener configuración de Pomodoro
export async function GET() {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('pomodoro_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) throw error;

    return NextResponse.json({ settings: data });
  } catch (error) {
    console.error('Error fetching pomodoro settings:', error);
    return NextResponse.json(
      { error: 'Error fetching pomodoro settings' },
      { status: 500 }
    );
  }
}

// PATCH: Actualizar configuración de Pomodoro
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { work_duration, short_break, long_break, sessions_until_long_break } = body;

    const supabase = createServerClient();

    // Primero obtenemos el ID de la configuración existente
    const { data: existing } = await supabase
      .from('pomodoro_settings')
      .select('id')
      .limit(1)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Settings not found' },
        { status: 404 }
      );
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (work_duration !== undefined) updateData.work_duration = work_duration;
    if (short_break !== undefined) updateData.short_break = short_break;
    if (long_break !== undefined) updateData.long_break = long_break;
    if (sessions_until_long_break !== undefined) updateData.sessions_until_long_break = sessions_until_long_break;

    const { data, error } = await supabase
      .from('pomodoro_settings')
      .update(updateData)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ settings: data });
  } catch (error) {
    console.error('Error updating pomodoro settings:', error);
    return NextResponse.json(
      { error: 'Error updating pomodoro settings' },
      { status: 500 }
    );
  }
}
