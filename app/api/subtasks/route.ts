import { NextResponse } from 'next/server';
import { createServerClient } from '@/db/db';

// GET: Obtener subtareas (por task_id o por fecha)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('task_id');
    const date = searchParams.get('date');

    const supabase = createServerClient();

    let query = supabase.from('subtasks').select('*');

    if (taskId) {
      query = query.eq('task_id', taskId);
    } else if (date) {
      // Obtener todas las subtareas de tareas de esa fecha + las independientes
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('task_date', date);

      if (tasks && tasks.length > 0) {
        const taskIds = tasks.map(t => t.id);
        // Obtener subtareas de las tareas del día O subtareas independientes
        query = query.or(`task_id.in.(${taskIds.join(',')}),task_id.is.null`);
      } else {
        // No hay tareas, solo subtareas independientes
        query = query.is('task_id', null);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ subtasks: data });
  } catch (error) {
    console.error('Error fetching subtasks:', error);
    return NextResponse.json(
      { error: 'Error fetching subtasks' },
      { status: 500 }
    );
  }
}

// POST: Crear una nueva subtarea
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { task_id, title, estimated_minutes, scheduled_time } = body;

    if (!title || !estimated_minutes) {
      return NextResponse.json(
        { error: 'Title and estimated_minutes are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const insertData: any = { task_id, title, estimated_minutes };
    if (scheduled_time) insertData.scheduled_time = scheduled_time;

    const { data, error } = await supabase
      .from('subtasks')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ subtask: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating subtask:', error);
    return NextResponse.json(
      { error: 'Error creating subtask' },
      { status: 500 }
    );
  }
}
