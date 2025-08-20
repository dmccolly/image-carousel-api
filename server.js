// server.js - Heroku-optimized Node.js API
const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for all domains
app.use(cors());
app.use(express.json());

// Your current images from GitHub repo
const imageList = [
    '01-BALLANCE-LONG-HAIR.jpg',
    '08-studio.jpg', 
    '2-3.png',
    '2.png',
    '20250730_122149 (1).jpg',
    '6.png',
    '7.png',
    '8.png',
    'Bronco-Roger-Simmons.jpg',
    'Channel-7-Bus.png',
    'Dave-Arthur-07A.jpg',
    'Don-Nelson-Michelle-Edmonds-Roland-Beres.pals.png',
    'HIBF-FB-7.png',
    'HIBF-WEB-MISC-107.jpg',
    'HIBF-WEB-MISC-135.jpg',
    'HIBF-WEB-MISC-163.jpg',
    'HIBF-WEB-MISC-220.jpg',
    'HIBF-WEB-STATIONS-05.jpg',
    'HIBF-WEB-STATIONS-07.jpg'
];

// Image metadata for better captions
const imageMetadata = {
    '01-BALLANCE-LONG-HAIR.jpg': 'Ballance - Early Radio Pioneer',
    '08-studio.jpg': 'Classic Radio Studio Setup',
    'Bronco-Roger-Simmons.jpg': 'Bronco Roger Simmons - Local Radio Personality',
    'Channel-7-Bus.png': 'Channel 7 Mobile Broadcasting Unit',
    'Dave-Arthur-07A.jpg': 'Dave Arthur - Broadcasting Legend',
    'Don-Nelson-Michelle-Edmonds-Roland-Beres.pals.png': 'Don Nelson, Michelle Edmonds & Roland Beres',
    'HIBF-FB-7.png': 'Idaho Broadcasting Foundation Archives',
    'HIBF-WEB-MISC-107.jpg': 'Broadcasting Heritage Collection',
    'HIBF-WEB-MISC-135.jpg': 'Radio Equipment Through the Decades',
    'HIBF-WEB-MISC-163.jpg': 'Idaho Media Legacy',
    'HIBF-WEB-MISC-220.jpg': 'Broadcasting History Archive',
    'HIBF-WEB-STATIONS-05.jpg': 'Historic Idaho Radio Stations',
    'HIBF-WEB-STATIONS-07.jpg': 'Broadcasting Station Development'
};

// Main carousel API endpoint
app.get('/api/carousel', (req, res) => {
    try {
        // Base URL for GitHub raw files (your images)
        const baseUrl = 'https://raw.githubusercontent.com/dmccolly/image-carousel-api/main/public/images';
        
        // Create a copy and shuffle for random order
        const shuffledImages = [...imageList].sort(() => Math.random() - 0.5);
        
        // Create image objects with metadata
        const images = shuffledImages.map(filename => {
            const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
            
            return {
                url: `${baseUrl}/${filename}`,
                caption: imageMetadata[filename] || cleanName,
                alt: `Idaho Broadcasting History - ${imageMetadata[filename] || cleanName}`,
                filename: filename
            };
        });
        
        res.json({
            images: images,
            meta: {
                total: images.length,
                last_updated: new Date().toISOString(),
                randomized: true,
                source: 'github',
                api_version: '2.0'
            }
        });
        
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            error: true,
            message: 'Failed to fetch carousel images',
            images: [{
                url: 'https://raw.githubusercontent.com/dmccolly/image-carousel-api/main/public/images/HIBF-FB-7.png',
                caption: 'Idaho Broadcasting Foundation',
                alt: 'Idaho Broadcasting Foundation Logo'
            }],
            meta: {
                total: 1,
                last_updated: new Date().toISOString(),
                error: true
            }
        });
    }
});

// Health check endpoint for Heroku
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '2.0'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Idaho Broadcasting Foundation Carousel API',
        endpoints: {
            carousel: '/api/carousel',
            health: '/health'
        },
        documentation: 'Returns randomized carousel images from Idaho Broadcasting history',
        source: 'https://github.com/dmccolly/image-carousel-api'
    });
});

// Image list endpoint (for debugging)
app.get('/api/images', (req, res) => {
    const baseUrl = 'https://raw.githubusercontent.com/dmccolly/image-carousel-api/main/public/images';
    
    const images = imageList.map(filename => ({
        filename: filename,
        url: `${baseUrl}/${filename}`,
        caption: imageMetadata[filename] || filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ')
    }));
    
    res.json({
        images: images,
        total: images.length,
        last_updated: new Date().toISOString()
    });
});

// Handle 404s
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        available_endpoints: [
            'GET /',
            'GET /api/carousel',
            'GET /api/images', 
            'GET /health'
        ]
    });
});

// Use Heroku's port or default to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🎬 Idaho Broadcasting Carousel API running on port ${PORT}`);
    console.log(`📷 Carousel endpoint: /api/carousel`);
    console.log(`❤️  Health check: /health`);
    console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
