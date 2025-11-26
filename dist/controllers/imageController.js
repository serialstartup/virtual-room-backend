export const proxyImage = async (req, res) => {
    try {
        const { url } = req.query;
        if (!url || typeof url !== 'string') {
            return res.status(400).json({ error: 'URL parameter is required' });
        }
        // Validate that it's a fashn.ai URL for security
        if (!url.includes('cdn.fashn.ai')) {
            return res.status(400).json({ error: 'Invalid image URL' });
        }
        console.log('[IMAGE_PROXY] 📸 Fetching image:', url);
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://fashn.ai',
                'Accept': 'image/*'
            }
        });
        if (!response.ok) {
            console.log('[IMAGE_PROXY] ❌ Failed to fetch:', response.status, response.statusText);
            return res.status(response.status).json({ error: 'Failed to fetch image' });
        }
        // Set appropriate headers
        res.set({
            'Content-Type': response.headers.get('content-type') || 'image/jpeg',
            'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            'Access-Control-Allow-Origin': '*'
        });
        console.log('[IMAGE_PROXY] ✅ Image proxy successful');
        // Stream the image data using Node.js streams
        if (response.body) {
            const reader = response.body.getReader();
            const pump = async () => {
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done)
                            break;
                        res.write(Buffer.from(value));
                    }
                    res.end();
                }
                catch (error) {
                    console.error('[IMAGE_PROXY] ❌ Stream error:', error);
                    res.status(500).json({ error: 'Stream error' });
                }
            };
            await pump();
        }
        else {
            res.status(500).json({ error: 'No image data received' });
        }
    }
    catch (error) {
        console.error('[IMAGE_PROXY] 🚨 Proxy error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
//# sourceMappingURL=imageController.js.map