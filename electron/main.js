const path = require('path');
const fs = require('fs')
const db = require('./db')
const moment = require('moment')
const { app, BrowserWindow, ipcMain } = require('electron');

const isDev = !app.isPackaged
const additionalData = { key: 'tryment' }
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

    ipcMain.on('min', () => {
        win.minimize();
    });
    ipcMain.on('max', () => {
        win.isMaximized() ? win.restore() : win.maximize();
    });
    ipcMain.on('close', () => {
        win.close();
    });
    ipcMain.on('createNote', (e, arg) => {
        const updateDateTime = moment(new Date()).format('YYYY-MM-DD hh:mm:ss')
        const createNote = db.prepare("INSERT INTO T_NOTE(title, content, updateDateTime) VALUES(?, ?, ?)")
        const res = createNote.run("无标题笔记", "", updateDateTime)
        e.returnValue = res
    })
    ipcMain.on('getNote', (e, arg) => {
        const getNote = db.prepare("select * from T_NOTE where id = ?")
        const res = getNote.get(arg)
        e.returnValue = res
    })
    ipcMain.on('getNoteList', (e, arg) => {
        const getNoteList = db.prepare("select * from T_NOTE where title like '%" + arg + "%' or content like '%" + arg + "%'")
        const res = getNoteList.all()
        e.returnValue = res
    })
    ipcMain.on('updateNote', (e, arg) => {
        const { id, title, content } = arg
        const updateDateTime = moment(new Date()).format('YYYY-MM-DD hh:mm:ss')
        const updateNote = db.prepare("update T_NOTE set title=?, content=?, updateDateTime=? where id=?")
        const res = updateNote.run(title, content, updateDateTime, id)
        e.returnValue = res
    })
    ipcMain.on('deleteNote', (e, arg) => {
        const delNote = db.prepare("delete from T_NOTE where id=?")
        const res = delNote.run(arg)
        e.returnValue = res
    })
    ipcMain.on('upload', (e, arg) => {
        const { imgBuffer, imgName } = arg
        const dirName = moment(new Date()).format('YYYYMMDD')
        const dir = path.join(process.cwd(), `./uploads/${dirName}`)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }, () => { })
        const filePath = path.join(dir, imgName)
        fs.writeFile(filePath, imgBuffer, (err) => {
            e.returnValue = err === null ? filePath : undefined
        })
    })
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
    app.on('second-instance', () => {
        if (win) {
            if (win.isMinimized()) win.restore()
            win.focus()
            win.show()
        }
    })
    app.whenReady().then(() => {
        createWindow();
    });
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
