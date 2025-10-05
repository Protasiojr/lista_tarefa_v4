import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

interface UpdateUserData {
  email?: string;
  nome?: string;
  senha?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const user = await prisma.usuario.findUnique({
      where: { id: idNum },
      select: {
        id: true,
        email: true,
        nome: true,
        // Excluir senha
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const { email, nome, senha } = await request.json();

    const updateData: UpdateUserData = {};
    if (email) updateData.email = email;
    if (nome) updateData.nome = nome;
    if (senha) updateData.senha = await bcrypt.hash(senha, 10);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
    }

    const user = await prisma.usuario.update({
      where: { id: idNum },
      data: updateData,
      select: {
        id: true,
        email: true,
        nome: true,
      },
    });

    return NextResponse.json({ message: 'Usuário atualizado com sucesso', user });
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 });
    }
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
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
    const { id } = await params;
    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    await prisma.usuario.delete({
      where: { id: idNum },
    });

    return NextResponse.json({ message: 'Usuário deletado com sucesso' });
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}