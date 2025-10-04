const { PrismaClient } = require('../app/generated/prisma');
const bcrypt = require('bcryptjs');
const { SignJWT } = require('jose');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function criarUsuario(email, nome, senha) {
  try {
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
      .sign(new TextEncoder().encode(JWT_SECRET));

    console.log('Usuário criado com sucesso:', { id: user.id, email: user.email, nome: user.nome });
    console.log('Token JWT:', token);

    await prisma.$disconnect();
  } catch (error) {
    if (error.code === 'P2002') {
      console.error('Erro: Email já cadastrado');
    } else {
      console.error('Erro ao criar usuário:', error);
    }
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Exemplo de uso: node script/crie_usuario.js email@example.com "Nome Usuario" senha123
const [,, email, nome, senha] = process.argv;
if (!email || !nome || !senha) {
  console.log('Uso: node script/crie_usuario.js <email> <nome> <senha>');
  process.exit(1);
}

criarUsuario(email, nome, senha);