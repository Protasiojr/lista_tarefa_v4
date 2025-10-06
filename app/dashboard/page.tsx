import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { SidebarLayout } from '@/components/sidebar';
import { DashboardContent } from '@/components/dashboard-content';

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
      <DashboardContent initialTarefas={tarefas} user={user} />
    </SidebarLayout>
  );
}