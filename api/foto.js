const { KEY } = require('./_drive');

module.exports = async (req, res) => {
  const id = String(req.query.id || '');
  const w = Math.min(parseInt(req.query.w, 10) || 800, 1600);
  if (!/^[\w-]{10,}$/.test(id)) return res.status(400).end('id inválido');
  const sources = [
    `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`,
    `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${KEY}`
  ];
  for (const url of sources) {
    try {
      const r = await fetch(url, { redirect: 'follow' });
      const type = r.headers.get('content-type') || '';
      if (r.ok && type.startsWith('image/')) {
        const buf = Buffer.from(await r.arrayBuffer());
        res.setHeader('Content-Type', type);
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800');
        return res.status(200).send(buf);
      }
    } catch (e) {}
  }
  res.status(404).end('Imagem não encontrada');
};
