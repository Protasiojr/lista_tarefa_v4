/* eslint-disable */
require('dotenv').config();
const { PrismaClient } = require('../../app/generated/prisma');
const bcrypt = require('bcryptjs');
const { SignJWT } = require('jose');

async function main() {
  const prisma = new PrismaClient();

  try {
    const [,, email, nome, senha] = process.argv;

    if (!email || !nome || !senha) {
      console.error('Uso: node crie_usuario.js <email> <nome> <senha>');
      process.exit(1);
    }

    const hashedSenha = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        email,
        nome,
        senha: hashedSenha
      }
    });

    console.log('Usuário criado com sucesso:', { id: usuario.id, email: usuario.email, nome: usuario.nome });

    // Gerar token JWT
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const token = await new SignJWT({ userId: usuario.id, email: usuario.email })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(secret);

      console.log('Token JWT gerado:', token);
    } catch (jwtError) {
      console.error('Erro ao gerar token JWT:', jwtError.message);
    }
  } catch (error) {
    console.error('Erro ao criar usuário:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();