document.addEventListener("DOMContentLoaded", () => {
  // Your code here

  const videoInput = document.getElementById("videoInput");
  const dropZone = document.getElementById("dropZone");
  const selectedPathElement = document.getElementById("selectedPath");

  videoInput.addEventListener("change", (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const videoPath = selectedFile.path;
      showSelectedPath(videoPath);
    }
  });

  dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("hover");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("hover");
  });

  dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("hover");

    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      const videoPath = droppedFile.path;
      showSelectedPath(videoPath);
    }
  });
  function showSelectedPath(videoPath) {
    selectedPathElement.textContent = `Selected Video Path: ${videoPath}`;
    selectedPathElement.style.display = "block";

    const buttonContainer = document.querySelector(".buttons-container"); // Use querySelector instead of getElementsByClassName
    const srt = document.createElement("button");
    srt.textContent = "Generate SRT"; // Use textContent to set button text
    srt.className = "btn btn-primary";

    const audio = document.createElement("button");
    audio.textContent = "Generate translated audio"; // Correctly set button text
    audio.className = "btn btn-primary";

    const video = document.createElement("button");
    video.textContent = "Translate video"; // Correctly set button text
    video.className = "btn btn-primary";

    buttonContainer.appendChild(srt); // Use appendChild to add buttons
    buttonContainer.appendChild(audio);
    buttonContainer.appendChild(video);

    srt.addEventListener("click", () => {
      ipcRenderer.send("local-upload-srt", videoPath);
    });
    audio.addEventListener("click", () => {
      ipcRenderer.send("local-upload-audio", videoPath);
    });
    video.addEventListener("click", () => {
      ipcRenderer.send("local-upload-video", videoPath);
    });
  }
});
