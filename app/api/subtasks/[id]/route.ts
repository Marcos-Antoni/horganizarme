import { NextResponse } from 'next/server';
import { createServerClient } from '@/db/db';

// PATCH: Actualizar una subtarea
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, estimated_minutes, completed, started_at, completed_at } = body;

    const supabase = createServerClient();

    const updateData: any = { updated_at: new Date().toISOString() };
    if (title !== undefined) updateData.title = title;
    if (estimated_minutes !== undefined) updateData.estimated_minutes = estimated_minutes;
    if (completed !== undefined) {
      updateData.completed = completed;
      // Si se marca como completada y no tiene completed_at, agregarlo
      if (completed && !completed_at && updateData.completed_at === undefined) {
        updateData.completed_at = new Date().toISOString();
      }
    }
    if (started_at !== undefined) updateData.started_at = started_at;
    if (completed_at !== undefined) updateData.completed_at = completed_at;

    const { data, error } = await supabase
      .from('subtasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ subtask: data });
  } catch (error) {
    console.error('Error updating subtask:', error);
    return NextResponse.json(
      { error: 'Error updating subtask' },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar una subtarea
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subtask:', error);
    return NextResponse.json(
      { error: 'Error deleting subtask' },
      { status: 500 }
    );
  }
}
