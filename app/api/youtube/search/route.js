import { NextResponse } from 'next/server';

// Múltiples instancias de Piped + Invidious como respaldo
const SOURCES = [
  // Piped instances
  { type: 'piped', url: 'https://pipedapi.kavin.rocks' },
  { type: 'piped', url: 'https://api.piped.yt' },
  { type: 'piped', url: 'https://pipedapi.adminforge.de' },
  { type: 'piped', url: 'https://pipedapi.leptons.xyz' },
  // Invidious instances (respaldo)
  { type: 'invidious', url: 'https://inv.nadeko.net' },
  { type: 'invidious', url: 'https://invidious.fdn.fr' },
  { type: 'invidious', url: 'https://yt.artemislena.eu' }
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Falta el parámetro ?q=' }, { status: 400 });
  }

  for (const source of SOURCES) {
    try {
      let url, response, data;

      if (source.type === 'piped') {
        url = `${source.url}/search?q=${encodeURIComponent(query)}&filter=videos`;
        response = await fetch(url, { next: { revalidate: 120 } });
        
        if (!response.ok) continue;
        data = await response.json();

        const resultados = data.items
          ?.filter(item => item.type === 'stream')
          .slice(0, 5)
          .map(item => ({
            titulo: item.title,
            canal: item.uploaderName,
            duracion: formatDuration(item.duration),
            vistas: item.views,
            url: `https://youtube.com/watch?v=${item.url?.replace('/watch?v=', '')}`,
            thumbnail: item.thumbnail
          })) || [];

        if (resultados.length > 0) {
          return NextResponse.json({
            exito: true,
            source: 'piped',
            query,
            total: resultados.length,
            resultados
          });
        }

      } else if (source.type === 'invidious') {
        url = `${source.url}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
        response = await fetch(url, { next: { revalidate: 120 } });
        
        if (!response.ok) continue;
        data = await response.json();

        const resultados = data.slice(0, 5).map(item => ({
          titulo: item.title,
          canal: item.author,
          duracion: formatDuration(item.lengthSeconds),
          vistas: item.viewCount,
          url: `https://youtube.com/watch?v=${item.videoId}`,
          thumbnail: item.videoThumbnails?.[0]?.url
        }));

        if (resultados.length > 0) {
          return NextResponse.json({
            exito: true,
            source: 'invidious',
            query,
            total: resultados.length,
            resultados
          });
        }
      }
    } catch (error) {
      continue;
    }
  }

  return NextResponse.json(
    { error: 'No se pudo obtener resultados. Intenta de nuevo en unos minutos.' },
    { status: 500 }
  );
}

function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
