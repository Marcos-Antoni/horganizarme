import { NextResponse } from 'next/server';
import { createServerClient } from '@/db/db';

// PATCH: Completar una sesión Pomodoro
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { completed } = body;

    const supabase = createServerClient();

    const updateData: any = {};
    if (completed !== undefined) {
      updateData.completed = completed;
      if (completed) {
        updateData.completed_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ session: data });
  } catch (error) {
    console.error('Error updating pomodoro session:', error);
    return NextResponse.json(
      { error: 'Error updating pomodoro session' },
      { status: 500 }
    );
  }
}
