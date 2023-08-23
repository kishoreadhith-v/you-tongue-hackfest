window.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const videoInfoContainer = document.querySelector('.video-info');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const videoUrl = document.getElementById('videoUrl').value;

        try {
            const response = await fetch('http://localhost:5173/api/video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ videoUrl })
            });

            if (response.ok) {
                const data = await response.json();
                const videoInfo = data.video;

                // Display video information on the page
                videoInfoContainer.innerHTML = `
                    <h2>Video Information:</h2>
                    <p><strong>Title:</strong> ${videoInfo.title}</p>
                    <p><strong>Author:</strong> ${videoInfo.author}</p>
                    <p><strong>Length:</strong> ${videoInfo.length} seconds</p>
                `;
                if(videoInfo.tlExists){
                    const unlockBtn = document.createElement('button');
                    unlockBtn.textContent = 'Unlock';
                    videoInfoContainer.appendChild(unlockBtn);
                } else {
                    const tlBtn = document.createElement('button');
                    tlBtn.textContent = 'Translate';
                    videoInfoContainer.appendChild(tlBtn);
                    tlBtn.addEventListener('click', )
                }
            } else {
                console.error('Error:', response.statusText);
                videoInfoContainer.innerHTML = '<p>An error occurred while fetching video information.</p>';
            }
        } catch (error) {
            console.error('Error:', error);
            videoInfoContainer.innerHTML = '<p>An error occurred while processing the request.</p>';
        }
    });
});
