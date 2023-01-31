const path = require('path');
// const { readFile, writeFile, unlinkSync } = require('fs')
const { app, BrowserWindow, ipcMain } = require('electron');

const isDev = !app.isPackaged
const additionalData = { key: 'suixin' }
const gotTheLock = app.requestSingleInstanceLock(additionalData)

let win = null

function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 1200,
        minHeight: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
            preload: path.join(__dirname, 'preload.js'),
        },
        frame: false,
    });

    win.loadURL(
        isDev
            ? 'http://localhost:5173'
            : `file://${path.join(__dirname, '../dist/index.html')}`
    );

    isDev && win.webContents.openDevTools();

    ipcMain.on('getPort', () => {

    })
    ipcMain.on('min', () => {
        win.minimize();
    });
    ipcMain.on('max', () => {
        win.isMaximized() ? win.restore() : win.maximize();
    });
    ipcMain.on('close', () => {
        win.close();
    });
    // ipcMain.on('outputPDF', async (e, html) => {
    //     const appPath = app.getAppPath().replace('\\app.asar', '')
    //     const templatePath = `${appPath}/template/default.html`
    //     readFile(templatePath, { flag: 'r', encoding: 'utf-8' }, async (err, data) => {
    //         if (err !== null) console.log(err)
    //         else {
    //             try {
    //                 const __html__ = data.replace('#MARKDOWN_CONTENT#', html)
    //                 const __filePath__ = `${appPath}/print.pdf`
    //                 const __cachePath__ = `${appPath}/print.html`
    //                 writeFile(__cachePath__, __html__, (e) => { })
    //                 const window = new BrowserWindow({ show: false })
    //                 await window.loadURL(__cachePath__)
    //                 await window.webContents.printToPDF({
    //                 }).then((data) => {
    //                     writeFile(__filePath__, data, (e) => { })
    //                     window.destroy()
    //                     // 删除缓存
    //                     unlinkSync(__cachePath__)
    //                 })
    //             } catch (e) {

    //             }
    //         }
    //     })
    //     console.log(appPath);
    // })
}

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // 当运行第二个实例时,将会聚焦到mainWindow这个窗口
        if (win) {
            if (win.isMinimized()) win.restore()
            win.focus()
            win.show()
        }
    })
    app.whenReady().then(() => {
        const { serverAPP } = require(path.join(__dirname, '../server/main'));
        createWindow();
    });
}

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
