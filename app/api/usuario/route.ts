import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nome: true,
        // Excluir senha por segurança
      },
    });
    return NextResponse.json(usuarios);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, nome, senha } = await request.json();

    if (!email || !nome || !senha) {
      return NextResponse.json({ error: 'Campos obrigatórios: email, nome, senha' }, { status: 400 });
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Criar o usuário no banco
    const user = await prisma.usuario.create({
      data: {
        email,
        nome,
        senha: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        nome: true,
      },
    });

    return NextResponse.json({ message: 'Usuário criado com sucesso', user }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}