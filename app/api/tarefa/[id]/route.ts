import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getUserIdFromToken } from '../../../../lib/auth';

interface UpdateTarefaData {
  titulo?: string;
  descricao?: string;
  data?: Date;
  status?: boolean;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const tarefa = await prisma.tarefa.findUnique({
      where: { id: idNum },
      include: { itens: true },
    });

    if (!tarefa || tarefa.usuarioId !== userId) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
    }

    return NextResponse.json(tarefa);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar tarefa' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const { titulo, descricao, data, status } = await request.json();

    const updateData: UpdateTarefaData = {};
    if (titulo !== undefined) updateData.titulo = titulo;
    if (descricao !== undefined) updateData.descricao = descricao;
    if (data !== undefined) updateData.data = new Date(data);
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
    }

    const tarefa = await prisma.tarefa.update({
      where: { id: idNum },
      data: updateData,
      include: { itens: true },
    });

    if (tarefa.usuarioId !== userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    return NextResponse.json({ message: 'Tarefa atualizada com sucesso', tarefa });
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Verificar se a tarefa pertence ao usuário
    const tarefa = await prisma.tarefa.findUnique({
      where: { id: idNum },
    });

    if (!tarefa || tarefa.usuarioId !== userId) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
    }

    await prisma.tarefa.delete({
      where: { id: idNum },
    });

    return NextResponse.json({ message: 'Tarefa deletada com sucesso' });
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}