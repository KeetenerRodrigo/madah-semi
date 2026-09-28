const clean = v => String(v || '').trim().replace(/^['"]+|['"]+$/g, '').trim();
const KEY = clean(process.env.GOOGLE_API_KEY) || 'AIzaSyA1uAm6CruceiwSNW2-TbmOuJr8rlYRSxU';
const RAW_ROOT = clean(process.env.DRIVE_FOLDER_ID) || '1hjZJdIQ4Q4SBQcH6xFhxDdUm6Hw8z530';
const ROOT = (RAW_ROOT.match(/folders\/([\w-]+)/) || RAW_ROOT.match(/[?&]id=([\w-]+)/) || [null, RAW_ROOT])[1];
const FOLDER = 'application/vnd.google-apps.folder';

async function list(parent) {
  const files = [];
  let pageToken = '';
  do {
    const q = encodeURIComponent(`'${parent}' in parents and trashed=false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=nextPageToken,files(id,name,mimeType)&pageSize=1000&orderBy=folder,name_natural&key=${KEY}${pageToken ? `&pageToken=${pageToken}` : ''}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Drive ${r.status}: ${await r.text()}`);
    const d = await r.json();
    files.push(...(d.files || []));
    pageToken = d.nextPageToken;
  } while (pageToken);
  return files;
}

function toPrice(s) {
  let t = String(s).replace(/r\$\s*/i, '').trim();
  if (/^\d{1,3}(\.\d{3})+,\d{1,2}$/.test(t)) t = t.replace(/\./g, '').replace(',', '.');
  else t = t.replace(',', '.');
  return /^\d+(\.\d+)?$/.test(t) ? Number(t) : null;
}
function parseName(filename) {
  const base = filename.replace(/\.[a-z0-9]{2,5}$/i, '').trim();
  const parts = base.split(/\s+-\s+/);
  if (parts.length >= 3) {
    const price = toPrice(parts[parts.length - 1]);
    return price != null
      ? { code: parts[0], name: parts.slice(1, -1).join(' - '), price }
      : { code: parts[0], name: parts.slice(1).join(' - '), price: null };
  }
  if (parts.length === 2) {
    const price = toPrice(parts[1]);
    return price != null ? { code: '', name: parts[0], price } : { code: parts[0], name: parts[1], price: null };
  }
  return { code: '', name: base, price: null };
}
const cleanFolder = n => n.replace(/^\d+\s*[-.)]\s*/, '').trim();
const img = id => `/api/foto?id=${id}`;

async function build(id, name, depth = 0) {
  const files = await list(id);
  const allFolders = files.filter(f => f.mimeType === FOLDER);
  const igFolder = depth === 0 ? allFolders.find(f => /^instagram$/i.test(cleanFolder(f.name))) : null;
  const folders = allFolders.filter(f => f !== igFolder);
  const instagram = igFolder
    ? (await list(igFolder.id)).filter(f => (f.mimeType || '').startsWith('image/')).slice(0, 6).map(f => img(f.id))
    : undefined;
  const images = files.filter(f => (f.mimeType || '').startsWith('image/'));
  const capa = images.find(f => /^capa\b/i.test(f.name));
  const products = images.filter(f => f !== capa).map(f => ({ id: f.id, ...parseName(f.name), image: img(f.id) }));
  const children = depth < 8
    ? (await Promise.all(folders.map(f => build(f.id, f.name, depth + 1)))).filter(c => c.count > 0)
    : [];
  const count = products.length + children.reduce((s, c) => s + c.count, 0);
  const cover = capa ? img(capa.id) : (products[0]?.image || children.find(c => c.cover)?.cover || null);
  return { id, name: cleanFolder(name), cover, count, children, products, instagram };
}

module.exports = { KEY, ROOT, build };
