/* eslint-disable */
require('dotenv').config();
const { PrismaClient } = require('../../app/generated/prisma');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  const prisma = new PrismaClient();

  try {
    const email = await question('Email: ');
    const nome = await question('Nome: ');
    const senha = await question('Senha: ');

    const hashedSenha = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        email,
        nome,
        senha: hashedSenha
      }
    });

    console.log('Usuário criado com sucesso:', { id: usuario.id, email: usuario.email, nome: usuario.nome });
  } catch (error) {
    console.error('Erro ao criar usuário:', error.message);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

main();