import { NextResponse } from 'next/server';

// Lista de instancias de Invidious (si una falla, usa otra)
const INSTANCIAS = [
  'https://inv.nadeko.net',
  'https://invidious.fdn.fr',
  'https://yt.artemislena.eu',
  'https://invidious.privacyredirect.com'
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Falta el parámetro q' }, { status: 400 });
  }

  for (const instancia of INSTANCIAS) {
    try {
      const response = await fetch(
        `${instancia}/api/v1/search?q=${encodeURIComponent(query)}&type=video`,
        { next: { revalidate: 60 } }
      );

      if (!response.ok) continue;

      const data = await response.json();

      const videos = data.slice(0, 5).map(video => ({
        titulo: video.title,
        autor: video.author,
        videoId: video.videoId,
        duracion: video.lengthSeconds,
        vistas: video.viewCount,
        url: `https://youtube.com/watch?v=${video.videoId}`,
        thumbnail: video.videoThumbnails?.[0]?.url
      }));

      return NextResponse.json({
        exito: true,
        resultados: videos
      });
    } catch (error) {
      continue;
    }
  }

  return NextResponse.json(
    { error: 'No se pudo conectar con YouTube' },
    { status: 500 }
  );
}
