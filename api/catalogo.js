const { ROOT, KEY, build } = require('./_drive');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const tree = await build(ROOT, 'Todas as peças');
    tree.name = 'Todas as peças';
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    res.status(200).json(tree);
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).json({
      error: e.message,
      pasta: ROOT,
      chave: KEY ? `${KEY.slice(0, 6)}…${KEY.slice(-4)} (${KEY.length} caracteres)` : 'ausente',
      node: process.version
    });
  }
};
