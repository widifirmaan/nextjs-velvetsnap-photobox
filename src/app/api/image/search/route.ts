import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query || !query.trim()) {
      return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 });
    }

    const apiKey = process.env.PIXABAY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Pixabay API key not configured. Set PIXABAY_API_KEY in .env.local' },
        { status: 500 }
      );
    }

    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=all&per_page=12&safesearch=true`;

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: data.error || 'Pixabay search failed' },
        { status: res.status }
      );
    }

    const results = (data.hits || []).map((item: any) => ({
      url: item.largeImageURL,
      thumbnail: item.previewURL,
      title: item.tags,
      source: item.pageURL,
    }));

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
