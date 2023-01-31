const path = require('path')
const fs = require('fs')
const Koa = require('koa')
const router = require('../router')
const koaBody = require('koa-body')

const serverAPP = new Koa()

const uploadDir = path.join(__dirname, '../upload')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir)

serverAPP.use(koaBody({
    multipart: true,
    formidable: {
        uploadDir,
        keepExtensions: true,
        onFileBegin: (name, file) => {
            const time = new Date();
            const dirName = '' + time.getFullYear() + (time.getMonth() + 1) + time.getDate();;
            const dir = path.join(__dirname, `../upload/${dirName}`);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir)
            file.newFilename = file.originalFilename
            file.filepath = `${dir}/${file.originalFilename}`
        },
        onError: (e) => {
            console.log(e);
        }
    }
}))
serverAPP.use(router.routes()).use(router.allowedMethods())

module.exports = serverAPP