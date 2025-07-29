// server.js - Heroku API server to scan image folders
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes (so Wix can access your API)
app.use(cors());
app.use(express.json());

// Configuration
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];
const IMAGES_FOLDER = process.env.IMAGES_FOLDER || './public/images'; // Folder to scan

// Utility function to check if file is an image
function isImageFile(filename) {
    const ext = path.extname(filename).toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext);
}

// Utility function to scan directory for images
async function scanImagesDirectory(folderPath) {
    try {
        // Create directory if it doesn't exist
        try {
            await fs.access(folderPath);
        } catch (error) {
            console.log(`Creating directory: ${folderPath}`);
            await fs.mkdir(folderPath, { recursive: true });
        }
        
        const files = await fs.readdir(folderPath);
        const imageFiles = files.filter(isImageFile);
        
        // Sort files naturally (1, 2, 10 instead of 1, 10, 2)
        imageFiles.sort((a, b) => {
            return a.localeCompare(b, undefined, {
                numeric: true,
                sensitivity: 'base'
            });
        });
        
        return imageFiles;
    } catch (error) {
        console.error('Error scanning directory:', error);
        throw error;
    }
}

// Main API endpoint - returns list of all images in the folder
app.get('/api/images', async (req, res) => {
    try {
        console.log(`Scanning folder: ${IMAGES_FOLDER}`);
        
        const imageFiles = await scanImagesDirectory(IMAGES_FOLDER);
        
        console.log(`Found ${imageFiles.length} images:`, imageFiles);
        
        res.json({
            images: imageFiles,
            count: imageFiles.length,
            folder: IMAGES_FOLDER,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            error: 'Failed to scan images',
            message: error.message,
            folder: IMAGES_FOLDER
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        images_folder: IMAGES_FOLDER
    });
});

// Optional: Serve images directly from this server
app.use('/images', express.static(IMAGES_FOLDER));

// Optional: Get detailed info about images
app.get('/api/images/details', async (req, res) => {
    try {
        const imageFiles = await scanImagesDirectory(IMAGES_FOLDER);
        
        const detailedInfo = await Promise.all(
            imageFiles.map(async (filename) => {
                const filePath = path.join(IMAGES_FOLDER, filename);
                const stats = await fs.stat(filePath);
                
                return {
                    filename,
                    size: stats.size,
                    modified: stats.mtime,
                    extension: path.extname(filename),
                    url: `/images/${filename}`
                };
            })
        );
        
        res.json({
            images: detailedInfo,
            count: detailedInfo.length
        });
        
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get image details',
            message: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Images folder: ${IMAGES_FOLDER}`);
    console.log(`API endpoint: http://localhost:${PORT}/api/images`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

// Export for testing
module.exports = app;
