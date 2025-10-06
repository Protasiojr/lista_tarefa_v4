import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function getUserIdFromToken(request: NextRequest): Promise<number | null> {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return null;
    }
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.userId as number;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return null;
  }
}