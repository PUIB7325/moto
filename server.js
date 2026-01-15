const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8000;
const SERVER_DIR = __dirname;

const server = http.createServer((req, res) => {
    // Gérer les CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Décoder l'URL proprement
    const parsedUrl = url.parse(req.url, true);
    const pathname = decodeURIComponent(parsedUrl.pathname);
    
    let filePath = path.join(SERVER_DIR, pathname === '/' ? 'index.html' : pathname);
    
    // Sécurité : éviter les remontées de répertoire
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(path.normalize(SERVER_DIR))) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            console.log(`❌ Fichier non trouvé: ${filePath}`);
            res.writeHead(404);
            res.end('File not found');
            return;
        }

        console.log(`✅ Serveur: ${filePath}`);

        // Déterminer le type MIME
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html; charset=utf-8',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.pdf': 'application/pdf',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml'
        };

        const contentType = mimeTypes[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', stats.size);
        res.setHeader('Cache-Control', 'public, max-age=3600');

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`\n✅ Serveur lancé sur http://localhost:${PORT}`);
    console.log(`📂 Répertoire serveur: ${SERVER_DIR}\n`);
});
