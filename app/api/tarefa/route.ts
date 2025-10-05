import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getUserIdFromToken } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const tarefas = await prisma.tarefa.findMany({
      where: { usuarioId: userId },
      include: { itens: true },
    });

    return NextResponse.json(tarefas);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar tarefas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { titulo, descricao, data, status } = await request.json();

    if (!titulo || !descricao || !data) {
      return NextResponse.json({ error: 'Campos obrigatórios: titulo, descricao, data' }, { status: 400 });
    }

    const tarefa = await prisma.tarefa.create({
      data: {
        titulo,
        descricao,
        data: new Date(data),
        status: status ?? false,
        usuarioId: userId,
      },
      include: { itens: true },
    });

    return NextResponse.json({ message: 'Tarefa criada com sucesso', tarefa }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}