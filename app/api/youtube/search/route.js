import { NextResponse } from 'next/server';
import ytm from 'node-youtube-music';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Falta el parámetro "q" (búsqueda)' },
      { status: 400 }
    );
  }

  try {
    const results = await ytm.search(query, { type: 'video' });
    
    const videos = results.slice(0, 5).map(video => ({
      titulo: video.title,
      artista: video.artists?.[0]?.name || 'Desconocido',
      url: `https://youtube.com/watch?v=${video.videoId}`,
      videoId: video.videoId,
      duracion: video.duration
    }));

    return NextResponse.json({
      exito: true,
      resultados: videos
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al buscar en YouTube' },
      { status: 500 }
    );
  }
}
