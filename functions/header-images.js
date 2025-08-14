export async function handler(event) {
  try {
    const qs = event.queryStringParameters || {};
    const set = qs.set || '';
    const url = new URL(process.env.XANO_HEADER_IMAGES_URL);
    if (set) url.searchParams.set('set', set);

    const resp = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
    });
    if (!resp.ok) {
      return { statusCode: resp.status, body: await resp.text() };
    }
    const data = await resp.json();
    const now = Date.now();

    const items = (Array.isArray(data) ? data : [])
      .filter(i => i && i.image_url)
      .filter(i => {
        const s = i.start_at ? Date.parse(i.start_at) : null;
        const e = i.end_at ? Date.parse(i.end_at) : null;
        return (!s || s <= now) && (!e || e >= now);
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': 'https://streamofdan.com',
      },
      body: JSON.stringify(items),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to load images' }) };
  }
}
