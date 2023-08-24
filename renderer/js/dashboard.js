const { ipcRenderer } = require("electron");

const searchBtn = document.getElementById("search");
searchBtn.addEventListener("click", () => {
  ipcRenderer.send("navigate", "search");
});

const uploadBtn = document.getElementById("local-upload");
uploadBtn.addEventListener("click", () => {
  ipcRenderer.send("navigate", "local-upload");
});

window.addEventListener("DOMContentLoaded", () => {
  const usernameElement = document.getElementById("username");
  const emailElement = document.getElementById("email");
  const pointsElement = document.getElementById("points");

  // Make a request to fetch user account information
  fetch("http://localhost:5173/api/account", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const { username, email, points } = data;
      usernameElement.textContent = username;
      emailElement.textContent = email;
      pointsElement.textContent = points;

      const unlockedVids = document.getElementsByClassName("unlocked");
      const translatedVids = document.getElementsByClassName("translated");

      // Fetch the list of videos from your API
      // Replace this with your actual API call
      const unlockedVideos = data.unlockedVideos;
      const translatedVideos = data.translations;
      // Create video entries and add them to the dashboard
      unlockedVideos.forEach((video) => {
        const videoEntry = document.createElement("div");
        videoEntry.className = "video-entry";

        const videoTitle = document.createElement("h3");
        videoTitle.textContent = video.title;

        const videoAuthor = document.createElement("p");
        videoAuthor.textContent = `Author: ${video.author}`;

        const playButton = document.createElement("button");
        playButton.textContent = "Play";
        playButton.addEventListener("click", () => {
          ipcRenderer.send("play", video.videoId);
        });

        // Append elements to the video entry
        videoEntry.appendChild(videoTitle);
        videoEntry.appendChild(videoAuthor);
        videoEntry.appendChild(playButton);

        // Append the video entry to the list container
        unlockedVids.appendChild(videoEntry);
      });

      translatedVideos.forEach((video) => {
        const videoEntry = document.createElement("div");
        videoEntry.className = "video-entry";

        const videoTitle = document.createElement("h3");
        videoTitle.textContent = video.title;

        const videoAuthor = document.createElement("p");
        videoAuthor.textContent = `Author: ${video.author}`;

        const playButton = document.createElement("button");
        playButton.textContent = "Play";
        playButton.addEventListener("click", () => {
          ipcRenderer.send("play", video.videoId);
        });

        // Append elements to the video entry
        videoEntry.appendChild(videoTitle);
        videoEntry.appendChild(videoAuthor);
        videoEntry.appendChild(playButton);

        // Append the video entry to the list container
        translatedVids.appendChild(videoEntry);
      });
    })
    .catch((error) => {
      console.error(error);
      // Handle the error, show an error message, etc.
    });
});
