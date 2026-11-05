import { NextResponse } from 'next/server';
import ytm from 'node-youtube-music';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('id');

  if (!videoId) {
    return NextResponse.json(
      { error: 'Falta el parámetro "id" (videoId)' },
      { status: 400 }
    );
  }

  try {
    const info = await ytm.getVideoInfo(videoId);
    
    return NextResponse.json({
      exito: true,
      info: {
        titulo: info.title,
        descripcion: info.description?.slice(0, 200),
        duracion: info.duration,
        vistas: info.viewCount,
        autor: info.author?.name,
        thumbnail: info.thumbnails?.[0]?.url
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener información del video' },
      { status: 500 }
    );
  }
}
