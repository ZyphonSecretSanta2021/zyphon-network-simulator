import {app, BrowserWindow} from "electron";
import * as express from "express";
import * as cleverbot from "cleverbot-free";

const server = express();

async function createWindow() {
    const win = new BrowserWindow({
        fullscreen: true,
        webPreferences: {
          devTools: false
        },
        title: "Zyphon Network Simulator",
        titleBarStyle: "hidden",
        icon: "game/sprites/logo.png"
    });

    await win.loadFile("game/index.html");
}

app.whenReady().then(async () => {
   await createWindow();

   app.on("activate", async () => {
       if (BrowserWindow.getAllWindows().length === 0) await createWindow();
   });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

server.get("/clever", async (request, response) => {
    if (typeof request.query.stimulus !== "string") return response.status(400).end();
    // @ts-ignore
    response.send(await cleverbot(request.query.stimulus, typeof request.query.context === "string" ? request.query.context.split(",") : undefined));
});

server.listen(8192);