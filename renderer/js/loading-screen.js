//const { ipcRenderer } = require("electron");

async function handleSuccess(jsonData, authToken) {
  if (jsonData.success) {
    // Remove the loader element
    page.removeChild(loader);

    // Display success message
    const successMessage = document.createElement("h3");
    successMessage.textContent =
      "Video successfully translated! Head to the dashboard to view your video.";
    successMessage.className = "success-msg";
    page.appendChild(successMessage);

    // Prepare data for the API request
    const requestData = {
      videoId: jsonData.videoId,
      tl: jsonData.videoPath,
      runTime: jsonData.runTime,
    };

    // Perform the API request
    try {
      const response = await fetch("http://localhost:5173/api/new-tl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const pointsData = document.createElement("h4");
        pointsData.textContent = `You have earned ${runTime} points!`;
      } else {
        // Handle API response errors
        const error = document.createElement("h4");
        error.textContent =
          "An error occurred while processing your request. please try again.";
        console.error("API request failed:", response.statusText);
      }
    } catch (error) {
      // Handle fetch error
      console.error("Fetch error:", error);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector(".page");
  const loader = document.querySelector(".loader");

  ipcRenderer.on("yt-translated", (event, jsonData) => {
    console.log("Translated JSON data:", jsonData);
    const authToken = localStorage.getItem("authToken");
    handleSuccess(jsonData, authToken);
  });

  ipcRenderer.on("local-srt-done", (event, jsonData) => {
    page.removeChild(loader);
    const successMessage = document.createElement("h3");
    successMessage.textContent = "SRT file successfully translated!";
    successMessage.className = "success-msg";
    page.appendChild(successMessage);
    const locateBtn = document.createElement("button");
    locateBtn.textContent = "Locate SRT file";
    locateBtn.className = "locate-btn";
    page.appendChild(locateBtn);
    locateBtn.addEventListener("click", () => {
      ipcRenderer.send("open-folder", jsonData.videoPath);
    });
  });

  ipcRenderer.on("local-audio-done", (event, jsonData) => {
    page.removeChild(loader);
    const successMessage = document.createElement("h3");
    successMessage.textContent = "Audio file successfully translated!";
    successMessage.className = "success-msg";
    page.appendChild(successMessage);
    const locateBtn = document.createElement("button");
    locateBtn.textContent = "Locate audio file";
    locateBtn.className = "locate-btn";
    page.appendChild(locateBtn);
    locateBtn.addEventListener("click", () => {
      ipcRenderer.send("open-folder", jsonData.videoPath);
    });
  });

  ipcRenderer.on("local-video-done", (event, jsonData) => {
    page.removeChild(loader);
    const successMessage = document.createElement("h3");
    successMessage.textContent = "video file successfully translated!";
    successMessage.className = "success-msg";
    page.appendChild(successMessage);
    const locateBtn = document.createElement("button");
    locateBtn.textContent = "Locate video file";
    locateBtn.className = "locate-btn";
    page.appendChild(locateBtn);
    locateBtn.addEventListener("click", () => {
      ipcRenderer.send("open-folder", jsonData.videoPath);
    });
  });
});
