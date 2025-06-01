const express = require('express');
const cors = require('cors'); // For local development, Vercel handles CORS for same-origin by default

// Note: @vercel/og is an ES Module, so we need dynamic import in CommonJS
// We'll do this inside the async route handler.
const sharp = require('sharp');

const app = express();

// Middleware
app.use(cors()); // Good for local testing, Vercel usually manages this
app.use(express.json()); // To parse JSON request bodies if you send any

// Define timeline data (this would ideally come from a DB or be passed in request)
const timelineData = [
    { number: 1, title: "Concept & Research", text: "Initial brainstorming, market research, and feasibility studies.", date: "Q1 2024", side: "right" },
    { number: 2, title: "Design & Prototyping", text: "User experience design, creating wireframes, mockups, and interactive prototypes.", date: "Q2 2024", side: "left" },
    { number: 3, title: "Development Phase 1", text: "Core feature development, backend setup, database design.", date: "Q3 2024", side: "right" },
    { number: 4, title: "Alpha Release & Testing", text: "Internal release for rigorous testing, bug fixing, and performance optimization.", date: "Q4 2024", side: "left" }
];

function generateTimelineItemHTML(item) {
    // Simplified inline styles for @vercel/og compatibility
    // Avoid complex CSS selectors if possible for @vercel/og. Inline styles are safest.
    const textAlign = item.side === 'left' ? 'right' : 'left';
    const numberBadgePosition = item.side === 'left' ? 'right: -15px;' : 'left: -15px;';

    return `
        <div style="width: 48%; margin-bottom: 30px; position: relative; ${item.side === 'left' ? 'margin-right: 2%;' : 'margin-left: 50%;'}">
            <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: ${textAlign}; position: relative;">
                <div style="position: absolute; top: -10px; ${numberBadgePosition} background-color: #e74c3c; color: white; width: 25px; height: 25px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9em;">
                    ${item.number}
                </div>
                <h3 style="margin-top: 0; margin-bottom: 5px; color: #2980b9; font-size: 1.1em;">${item.title}</h3>
                <p style="margin-top: 0; margin-bottom: 8px; font-size: 0.9em; color: #555;">${item.text}</p>
                <span style="font-size: 0.8em; color: #7f8c8d; font-style: italic;">${item.date}</span>
            </div>
        </div>
    `;
}


app.post('/api/take-screenshot', async (req, res) => {
    try {
        const { ImageResponse } = await import('@vercel/og');

        // Construct HTML for @vercel/og to render.
        // This will be a *representation* of your timeline for the screenshot.
        const screenshotHtml = `
            <div style="
                display: flex; flex-direction: column;
                width: 800px; /* Screenshot width */
                padding: 30px;
                background-color: #f4f7f6;
                font-family: 'Roboto', sans-serif;
            ">
                <div style="text-align: center; margin-bottom: 30px; padding: 15px; background-color: #2c3e50; color: white; border-radius: 6px;">
                    <h1 style="margin: 0 0 8px 0; font-size: 1.8em; font-weight: 700;">Project Timeline Showcase</h1>
                    <p style="margin: 0; font-size: 1em; font-weight: 300;">Key milestones and achievements.</p>
                </div>

                <div style="position: relative;">
                    <!-- Central Line for Screenshot -->
                    <div style="position: absolute; left: 50%; top: 0; bottom: 0; width: 3px; background-color: #3498db; transform: translateX(-50%);"></div>
                    
                    ${timelineData.map(item => generateTimelineItemHTML(item)).join('')}
                </div>
                
                <div style="text-align: center; margin-top: 30px; font-size: 0.8em; color: #7f8c8d;">
                    © Snapshot taken ${new Date().toLocaleDateString()}
                </div>
            </div>
        `;

        const image = new ImageResponse(
            screenshotHtml,
            {
                width: 800,  // Screenshot dimensions
                height: 600, // Adjust height based on content, or make it very tall if content varies
                              // Or calculate dynamically based on number of items (more complex)
                // You might need to provide font data if system fonts aren't sufficient
                // or if you use custom fonts not available in the Vercel Edge Runtime.
                // fonts: [
                //    { name: 'Roboto', data: robotoFontDataBuffer, weight: 400, style: 'normal' },
                // ],
            }
        );

        const buffer = await image.arrayBuffer();

        const pngBuffer = await sharp(Buffer.from(buffer))
            .png({ quality: 90 })
            .toBuffer();

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'attachment; filename="timeline_screenshot.png"'); // Suggests download
        res.send(pngBuffer);

    } catch (error) {
        console.error("Error generating screenshot:", error);
        res.status(500).json({
            error: "Failed to generate screenshot",
            message: error.message,
            // stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = app; // Export the app for Vercel