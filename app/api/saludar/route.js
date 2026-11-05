import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    mensaje: "¡Hola desde mi API en Vercel!",
    status: "funcionando"
  });
}
