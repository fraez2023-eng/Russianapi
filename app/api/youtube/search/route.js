import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Falta el parámetro q' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );
    
    const html = await response.text();
    
    const regex = /"videoId":"([^"]+)","title":"([^"]+)"/g;
    const videos = [];
    let match;
    
    while ((match = regex.exec(html)) !== null && videos.length < 5) {
      videos.push({
        videoId: match[1],
        titulo: match[2].replace(/\\u0026/g, '&'),
        url: `https://youtube.com/watch?v=${match[1]}`
      });
    }

    return NextResponse.json({
      exito: true,
      resultados: videos
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al buscar' }, { status: 500 });
  }
}
