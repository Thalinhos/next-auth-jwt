// pages/api/auth/login.ts
import { generateToken } from '@/utils/JWT';
import { prisma } from '@/utils/prisma';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

 const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return NextResponse.json({ error: 'Senha inválida' }, { status: 401 });
  }

 const token = await generateToken(user.id, user.role);

  return NextResponse.json({ token });
}

export async function GET(req: NextRequest){
    return NextResponse.json({"titulo": "teste concluido"})
}