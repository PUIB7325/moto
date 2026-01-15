const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    const filePath = event.path.replace('/.netlify/functions/serve/', '');
    const decodedPath = decodeURIComponent(filePath);
    const fullPath = path.join(__dirname, '..', decodedPath);
    
    // Sécurité : éviter les remontées de répertoire
    const normalizedPath = path.normalize(fullPath);
    const baseDir = path.normalize(path.join(__dirname, '..'));
    
    if (!normalizedPath.startsWith(baseDir)) {
        return {
            statusCode: 403,
            body: 'Forbidden'
        };
    }

    try {
        if (!fs.existsSync(fullPath)) {
            return {
                statusCode: 404,
                body: 'File not found'
            };
        }

        const ext = path.extname(fullPath).toLowerCase();
        const mimeTypes = {
            '.pdf': 'application/pdf',
            '.html': 'text/html; charset=utf-8',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif'
        };

        const contentType = mimeTypes[ext] || 'application/octet-stream';
        const fileBuffer = fs.readFileSync(fullPath);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Length': fileBuffer.length,
                'Access-Control-Allow-Origin': '*'
            },
            body: fileBuffer.toString('base64'),
            isBase64Encoded: true
        };
    } catch (error) {
        console.error('Erreur:', error);
        return {
            statusCode: 500,
            body: 'Internal server error'
        };
    }
};
