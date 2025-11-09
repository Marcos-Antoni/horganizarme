import { NextResponse } from 'next/server';
import { createServerClient } from '@/db/db';

// GET: Obtener tareas (opcionalmente filtradas por fecha)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const supabase = createServerClient();

    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (date) {
      query = query.eq('task_date', date);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ tasks: data });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Error fetching tasks' },
      { status: 500 }
    );
  }
}

// POST: Crear una nueva tarea
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, task_date } = body;

    if (!title || !task_date) {
      return NextResponse.json(
        { error: 'Title and task_date are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ title, description, task_date }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ task: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Error creating task' },
      { status: 500 }
    );
  }
}
