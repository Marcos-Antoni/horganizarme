import { NextResponse } from 'next/server';
import { createServerClient } from '@/db/db';

// GET: Obtener sesiones Pomodoro (historial)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .select('*, tasks(title)')
      .order('started_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    return NextResponse.json({ sessions: data });
  } catch (error) {
    console.error('Error fetching pomodoro sessions:', error);
    return NextResponse.json(
      { error: 'Error fetching pomodoro sessions' },
      { status: 500 }
    );
  }
}

// POST: Crear una nueva sesión Pomodoro
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { task_id, session_type, duration } = body;

    if (!session_type || !duration) {
      return NextResponse.json(
        { error: 'session_type and duration are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .insert([{ task_id, session_type, duration }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ session: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating pomodoro session:', error);
    return NextResponse.json(
      { error: 'Error creating pomodoro session' },
      { status: 500 }
    );
  }
}
