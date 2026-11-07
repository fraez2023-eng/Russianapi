import { NextResponse } from 'next/server';

// Instancias públicas de Piped (scrapers de YouTube)
const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://api.piped.yt',
  'https://pipedapi.adminforge.de'
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Falta el parámetro ?q= (ej: ?q=bad bunny)' }, { status: 400 });
  }

  for (const instance of PIPED_INSTANCES) {
    try {
      // Hacemos el scraping a la API de Piped
      const res = await fetch(`${instance}/search?q=${encodeURIComponent(query)}&filter=videos`, {
        next: { revalidate: 120 } // Caché de 2 minutos para que sea instantáneo
      });

      if (!res.ok) continue; // Si falla esta instancia, prueba la siguiente

      const data = await res.json();

      // Filtramos y limpiamos los datos para tu bot
      const resultados = data.items
        .filter(item => item.type === 'stream') // Solo videos
        .slice(0, 5) // Top 5 resultados
        .map(item => ({
          titulo: item.title,
          canal: item.uploaderName,
          duracion: Math.floor(item.duration / 60) + ':' + String(item.duration % 60).padStart(2, '0'),
          vistas: item.views,
          subidos: item.uploadedDate,
          url: `https://youtube.com/watch?v=${item.url.replace('/watch?v=', '')}`,
          thumbnail: item.thumbnail
        }));

      return NextResponse.json({
        status: 'success',
        query: query,
        total: resultados.length,
        data: resultados
      });

    } catch (error) {
      continue; // Sigue intentando con la siguiente instancia
    }
  }

  return NextResponse.json({ error: 'Todos los scrapers fallaron, intenta de nuevo en unos minutos.' }, { status: 500 });
}
