const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");

// const { downloadVideo, videoInfo } = require("./downloader.js");

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";

const root = 'http://localhost:5173/'

let mainWindow;

// create the main window


function createMainWindow() {
  try {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js"),
      },
    });

    // Open devtools if in dev mode
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }

    mainWindow.loadURL(root);

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

ipcMain.on("url", async (event, url) => {
  try {
    const video = await videoInfo(url);
    console.log("Video info:", video);
    mainWindow.webContents.send("video-info", video);
  } catch (error) {
    console.error("Error processing video info:", error);
  }
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
];

// Quit app when all windows are closed

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});
