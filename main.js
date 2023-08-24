// use `npm install` in the terminal to install all the dependencies
// use `npm run start` in the terminal to start the server up

// Todo list (as of now):

// from the search page, when the user clicks "translate", it should trigger an event
// that runs dhakkshin's script
// use an event listener to listen for the event "click" and then run the script
// to run the script please chatgpt the needed info,
// I think theres a module called child_processes

// after the translation, use fetch() to make a post request to the server
// I haven't made the api yet, I'll lyk when I complete it
// this api should have videoId, username of the user who translated it and
// the length of the translated video in the body of the request
// the api should then update the database with
// the translated video info and add points to the user who translated

// update: wrote the api, it's in app.js, please check it out

// also add a list of video that the user has unlocked using points or translated themselves
//
// in the search page, if the video has already been translated, add an option to unlock for some points

// add a videoplayer for the user to watch the translated video, which links from the list of unlocked
// and translated videos from the search page. also feel free to change the page structure (anything which you think makes sense)
// let the video player be just a html video tag for now and we can make the player better later

// when this is done, I guess the main part of the app is done

// then an additional feature can be added where the user can translate their own videos from local storage(dhakkshin's script should be able to do this)
// the user can also just get the srt files by uploading their videos (dhakkshin's script will be updated soon to do just srts and uploaded videos too)

// -------------------------------------------------------------- //

const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const path = require("path");
// const { PythonShell } = require("python-shell");
const { exec } = require("child_process");
const fs = require("fs");
const fse = require("fs-extra");

// The path to the result JSON file
const filePath = "/result.json";

// const { downloadVideo, videoInfo } = require("./downloader.js");

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";

const root = "http://localhost:5173/";

let mainWindow;

// create the main window

function createMainWindow() {
  try {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js"),
      },
    });

    // Open devtools if in dev mode
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile("./renderer/login.html");

    mainWindow.once("ready-to-show", () => {
      mainWindow.show();
    });

    mainWindow.on("closed", () => {
      mainWindow = null;
    });

    return mainWindow;
  } catch (error) {
    console.error(error);
  }
}

function createPlayerWindow() {
  player = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  player.loadFile("./renderer/player.html");
}

// ipcMain.on("url", async (event, url) => {
//   try {
//     const video = await videoInfo(url);
//     console.log("Video info:", video);
//     mainWindow.webContents.send("video-info", video);
//   } catch (error) {
//     console.error("Error processing video info:", error);
//   }
// });

// load the required page file (html)
ipcMain.on("navigate", (event, pageName) => {
  const filePath = "./renderer/" + pageName + ".html";
  mainWindow.loadFile(filePath);
});

ipcMain.on("open-folder", (event, videoPath) => {
  shell.showItemInFolder(videoPath);
});

ipcMain.on("play", (event, videoId) => {
  const vlcCommand = `vlc ${videoId}`;
  exec(vlcCommand, (error, stdout, stderr) => {
    if (error) {
      console.error("Error:", error);
    }
  });
});

ipcMain.on("showLoginForm", (event, data) => {
  mainWindow.webContents.send("showLoginForm", data);
});

ipcMain.on("local-upload-srt", (event, videoPath) => {
  const filePath = "./renderer/" + "loading-screen" + ".html";
  mainWindow.loadFile(filePath);

  const pythonCommand = '"C:\\Program Files\\Python311\\python.exe"';
  const shell_string = `${pythonCommand} ./translate.py -l ${videoPath} -s 2> warning.txt`;
  exec(shell_string, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      mainWindow.webContents.send("showWarning", error.message);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      mainWindow.webContents.send("showWarning", stderr);
      return;
    }
    exec(test_string, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        mainWindow.webContents.send("showWarning", error.message);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        mainWindow.webContents.send("showWarning", stderr);
        return;
      }
      try {
        const jsonData = JSON.parse(stdout);
        // console.log("Parsed JSON data:", jsonData.message);
        ipcMain.send("local-srt-done", jsonData);
        // Handle the parsed JSON data as needed
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
      }
    });
  });
});

ipcMain.on("local-upload-audio", (event, videoPath) => {
  const filePath = "./renderer/" + "loading-screen" + ".html";
  mainWindow.loadFile(filePath);

  const pythonCommand = '"C:\\Program Files\\Python311\\python.exe"';
  const shell_string = `${pythonCommand} ./translate.py -l ${videoPath} -a 2> warning.txt`;
  exec(shell_string, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      mainWindow.webContents.send("showWarning", error.message);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      mainWindow.webContents.send("showWarning", stderr);
      return;
    }
    exec(test_string, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        mainWindow.webContents.send("showWarning", error.message);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        mainWindow.webContents.send("showWarning", stderr);
        return;
      }
      try {
        const jsonData = JSON.parse(stdout);
        // console.log("Parsed JSON data:", jsonData.message);
        ipcMain.send("local-audio-done", jsonData);
        // Handle the parsed JSON data as needed
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
      }
    });
  });
});

ipcMain.on("local-upload-video", (event, videoPath) => {
  const filePath = "./renderer/" + "loading-screen" + ".html";
  mainWindow.loadFile(filePath);

  const pythonCommand = '"C:\\Program Files\\Python311\\python.exe"';
  const shell_string = `${pythonCommand} ./translate.py -l ${videoPath} -v 2> warning.txt`;
  exec(shell_string, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      mainWindow.webContents.send("showWarning", error.message);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      mainWindow.webContents.send("showWarning", stderr);
      return;
    }
    exec(test_string, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        mainWindow.webContents.send("showWarning", error.message);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        mainWindow.webContents.send("showWarning", stderr);
        return;
      }
      try {
        const jsonData = JSON.parse(stdout);
        // console.log("Parsed JSON data:", jsonData.message);
        ipcMain.send("local-video-done", jsonData);
        // Handle the parsed JSON data as needed
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
      }
    });
  });
});

ipcMain.on("translate-yt-video", (event, videoUrl, videoId) => {
  const filePath = "./renderer/" + "loading-screen" + ".html";
  mainWindow.loadFile(filePath);
  const pythonCommand = '"C:\\Program Files\\Python311\\python.exe"';
  const shell_string = `${pythonCommand} ./translate.py -y ${videoUrl} -id ${videoId} -v > warning.txt 2>&1`;
  const test_string = `python ./hello.py`;
  // console.log(shell_string);
  exec(test_string, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      mainWindow.webContents.send("showWarning", error.message);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      mainWindow.webContents.send("showWarning", stderr);
      return;
    }
    try {
      const jsonData = JSON.parse(stdout);
      // console.log("Parsed JSON data:", jsonData.message);
      ipcMain.send("yt-translated", jsonData);
      // Handle the parsed JSON data as needed
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
    }
  });
});

// app is ready

app.whenReady().then(() => {
  createMainWindow();

  // Implemet menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  mainWindow.on("closed", () => (mainWindow = null));

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

//Menu template
const menu = [
  {
    label: "File",
    submenu: [
      {
        label: "Quit",
        click: () => app.quit(),
        accelerator: "CmdOrCtrl+Q",
      },
    ],
  },
  {
    label: "Player",
    submenu: [
      {
        label: "Player",
        click: () => createPlayerWindow(),
        accelerator: "CmdOrCtrl+Q",
      },
    ],
  },
];

// Quit app when all windows are closed

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});
