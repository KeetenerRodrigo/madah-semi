# Madah — site + catálogo pelo Google Drive

## Publicar na Vercel
1. Crie um repositório no GitHub com o conteúdo desta pasta (ou arraste a pasta em vercel.com/new).
2. Framework preset: **Other**. Não precisa de build.
3. Em *Settings → Environment Variables* adicione:
   - `GOOGLE_API_KEY` = sua chave
   - `DRIVE_FOLDER_ID` = `1hjZJdIQ4Q4SBQcH6xFhxDdUm6Hw8z530`
4. Deploy.

## Como organizar o Drive
- Cada pasta vira uma categoria, e cada subpasta uma subcategoria (sem limite de níveis).
- Nome da foto: `CODIGO - NOME - VALOR`. Exemplo: `AN001 - Anel Aurora - 189.90.jpg`
- Para definir a ordem das pastas, comece o nome com um número: `01 - Anéis`. O número não aparece no site.
- Para escolher a capa de uma pasta, coloque nela uma foto chamada `capa.jpg`. Sem ela, a capa é a primeira peça da pasta.
- Pastas vazias não aparecem no site.
- Uma pasta chamada `Instagram` na raiz alimenta a seção "Siga no Instagram" com as 6 primeiras fotos em ordem de nome. Use `1.jpg`, `2.jpg`… Essa pasta não aparece no catálogo.
- As mudanças no Drive aparecem no site em até 2 minutos.

## Endpoints
- `/api/catalogo`: árvore de pastas e peças em JSON
- `/api/foto?id=ID&w=700`: foto da peça, servida pelo seu domínio e guardada em cache
