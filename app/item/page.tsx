import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { CreateItemForm } from '@/components/create-item-form';

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

    return userId;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return null;
  }
}

export default async function CreateItemPage() {
  const userId = await getUserFromToken();

  if (!userId) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <CreateItemForm />
    </div>
  );
}