import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { SidebarLayout } from '@/components/sidebar';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as number;

    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true, nome: true, email: true },
    });

    return user;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return null;
  }
}

export default async function DashboardPage() {
  const user = await getUserFromToken();

  if (!user) {
    redirect('/login');
  }

  // Buscar tarefas do usuário
  const tarefas = await prisma.tarefa.findMany({
    where: { usuarioId: user.id },
    include: { itens: true },
  });

  return (
    <SidebarLayout user={user}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Bem-vindo, {user.nome}!</h1>
        <h2 className="text-xl mb-4">Suas Tarefas</h2>
        <div className="space-y-4">
          {tarefas.length === 0 ? (
          <p>Você ainda não tem tarefas.</p>
        ) : (
          tarefas.map((tarefa) => (
            <div key={tarefa.id} className="border p-4 rounded">
              <h3 className="font-semibold">{tarefa.titulo}</h3>
              <p>{tarefa.descricao}</p>
              <p>Status: {tarefa.status ? 'Concluída' : 'Pendente'}</p>
              <p>Data: {tarefa.data.toLocaleDateString('pt-BR')}</p>
              <h4>Itens:</h4>
              <ul>
                {tarefa.itens.map((item) => (
                  <li key={item.id}>{item.titulo}: {item.descricao}</li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
    </SidebarLayout>
  );
}