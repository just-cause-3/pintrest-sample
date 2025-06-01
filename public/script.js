document.addEventListener('DOMContentLoaded', () => {
    const screenshotBtn = document.getElementById('takeScreenshotBtn');

    if (screenshotBtn) {
        screenshotBtn.addEventListener('click', async () => {
            screenshotBtn.disabled = true;
            screenshotBtn.textContent = 'Capturing...';

            try {
                // For this example, the backend will generate a representation
                // of the timeline. We don't need to send HTML content from here.
                // If we wanted a screenshot of the *exact current view*,
                // that would require a different library like html2canvas on client
                // or Puppeteer on backend (more complex for Vercel serverless).

                const response = await fetch('/api/take-screenshot', {
                    method: 'POST',
                    // We could send data here if the backend needed to customize the screenshot
                    // headers: { 'Content-Type': 'application/json' },
                    // body: JSON.stringify({ title: "Custom Project Timeline" })
                });

                if (!response.ok) {
                    let errorMsg = 'Failed to capture screenshot.';
                    try {
                        const errorData = await response.json(); // Vercel often sends JSON errors
                        errorMsg += ` Server: ${response.status} - ${errorData.error || errorData.message || response.statusText}`;
                    } catch (e) {
                        errorMsg += ` Server: ${response.status} - ${response.statusText}`;
                    }
                    throw new Error(errorMsg);
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'timeline_screenshot.png';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

            } catch (error) {
                console.error('Screenshot Error:', error);
                alert(`Error: ${error.message}`);
            } finally {
                screenshotBtn.disabled = false;
                screenshotBtn.textContent = 'Take Screenshot of Timeline';
            }
        });
    }
});