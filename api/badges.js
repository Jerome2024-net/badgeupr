const { PrismaClient } = require('@prisma/client');
const { withAccelerate } = require('@prisma/extension-accelerate');

const prisma = new PrismaClient().$extends(withAccelerate());

// CORS headers
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

module.exports = async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200, headers);
        res.end();
        return;
    }

    // Set CORS headers
    Object.keys(headers).forEach(key => {
        res.setHeader(key, headers[key]);
    });

    try {
        if (req.method === 'GET') {
            // Get all badges
            const badges = await prisma.badge.findMany({
                orderBy: { createdAt: 'desc' },
                take: 50
            });
            res.status(200).json(badges);
        } 
        else if (req.method === 'POST') {
            // Create new badge
            const { prenom, nom, imageUrl } = req.body;
            
            if (!prenom || !nom || !imageUrl) {
                res.status(400).json({ error: 'Champs requis: prenom, nom, imageUrl' });
                return;
            }

            const badge = await prisma.badge.create({
                data: {
                    prenom,
                    nom,
                    imageUrl
                }
            });
            res.status(201).json(badge);
        } 
        else {
            res.status(405).json({ error: 'Méthode non autorisée' });
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
