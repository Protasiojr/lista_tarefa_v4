import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getUserIdFromToken } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tarefaId = searchParams.get('tarefaId');

    if (!tarefaId) {
      return NextResponse.json({ error: 'tarefaId é obrigatório' }, { status: 400 });
    }

    const tarefaIdNum = parseInt(tarefaId);
    if (isNaN(tarefaIdNum)) {
      return NextResponse.json({ error: 'tarefaId inválido' }, { status: 400 });
    }

    // Verificar se a tarefa pertence ao usuário
    const tarefa = await prisma.tarefa.findUnique({
      where: { id: tarefaIdNum },
    });

    if (!tarefa || tarefa.usuarioId !== userId) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
    }

    const itens = await prisma.item.findMany({
      where: { tarefaId: tarefaIdNum },
    });

    return NextResponse.json(itens);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar itens' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { titulo, descricao, tarefaId } = await request.json();

    if (!titulo || !descricao || !tarefaId) {
      return NextResponse.json({ error: 'Campos obrigatórios: titulo, descricao, tarefaId' }, { status: 400 });
    }

    const tarefaIdNum = parseInt(tarefaId);
    if (isNaN(tarefaIdNum)) {
      return NextResponse.json({ error: 'tarefaId inválido' }, { status: 400 });
    }

    // Verificar se a tarefa pertence ao usuário
    const tarefa = await prisma.tarefa.findUnique({
      where: { id: tarefaIdNum },
    });

    if (!tarefa || tarefa.usuarioId !== userId) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
    }

    const item = await prisma.item.create({
      data: {
        titulo,
        descricao,
        tarefaId: tarefaIdNum,
      },
    });

    return NextResponse.json({ message: 'Item criado com sucesso', item }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}