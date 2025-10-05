import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getUserIdFromToken } from '../../../../lib/auth';

interface UpdateItemData {
  titulo?: string;
  descricao?: string;
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

    const item = await prisma.item.findUnique({
      where: { id: idNum },
      include: { tarefa: true },
    });

    if (!item || item.tarefa.usuarioId !== userId) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar item' }, { status: 500 });
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

    const { titulo, descricao } = await request.json();

    const updateData: UpdateItemData = {};
    if (titulo !== undefined) updateData.titulo = titulo;
    if (descricao !== undefined) updateData.descricao = descricao;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
    }

    // Verificar se o item pertence ao usuário via tarefa
    const itemExistente = await prisma.item.findUnique({
      where: { id: idNum },
      include: { tarefa: true },
    });

    if (!itemExistente || itemExistente.tarefa.usuarioId !== userId) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    }

    const item = await prisma.item.update({
      where: { id: idNum },
      data: updateData,
    });

    return NextResponse.json({ message: 'Item atualizado com sucesso', item });
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
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

    // Verificar se o item pertence ao usuário
    const item = await prisma.item.findUnique({
      where: { id: idNum },
      include: { tarefa: true },
    });

    if (!item || item.tarefa.usuarioId !== userId) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    }

    await prisma.item.delete({
      where: { id: idNum },
    });

    return NextResponse.json({ message: 'Item deletado com sucesso' });
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}