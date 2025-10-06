import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { prisma } from '../../../../lib/prisma';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key'); // Defina uma chave secreta no .env

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
    });

    // Gerar token JWT
    const token = await new SignJWT({ id: user.id, email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    return NextResponse.json({ message: 'Usuário criado com sucesso', token }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}