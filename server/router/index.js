const Router = require('koa-router')
const moment = require('moment')
const router = new Router({ prefix: '/note' })
const resolve = require('../utils/resolve')
const db = require("../db/sqlite");

router.get('/add', (ctx, next) => {
    const updateDateTime = moment(new Date()).format('YYYY-MM-DD hh:mm:ss')
    const createNote = db.prepare("INSERT INTO T_NOTE(title, content, updateDateTime) VALUES(?, ?, ?)")
    const res = createNote.run("无标题笔记", "", updateDateTime)
    ctx.body = resolve.json(res, '添加笔记成功')
})
router.post('/list', (ctx, next) => {
    const { search = '' } = ctx.request.body
    const getNoteList = db.prepare("select * from T_NOTE where title like '%" + search + "%' or content like '%" + search + "%'")
    const res = getNoteList.all()
    ctx.body = resolve.json(res, '获取笔记列表成功')
})
router.post('/get', (ctx, next) => {
    const { id } = ctx.request.body
    const getNote = db.prepare("select * from T_NOTE where id = ?")
    const res = getNote.get(id)
    ctx.body = resolve.json(res, '获取笔记详情成功')
})
router.post('/save', (ctx, next) => {
    const { id, title, content } = ctx.request.body
    const updateDateTime = moment(new Date()).format('YYYY-MM-DD hh:mm:ss')
    const updateNote = db.prepare("update T_NOTE set title=?, content=?, updateDateTime=? where id=?")
    const res = updateNote.run(title, content, updateDateTime, id)
    ctx.body = resolve.json(res, '修改笔记成功')
})
router.post('/del', (ctx, next) => {
    console.log(ctx.request.body);
    const { id } = ctx.request.body
    const delNote = db.prepare("delete from T_NOTE where id=?")
    const res = delNote.run(id)
    ctx.body = resolve.json(res, '删除笔记成功')
})
router.post('/upload', (ctx, next) => {
    const { file } = ctx.request.files
    const reg = new RegExp(".*\\upload\\\\", "g");
    let pathArr = (file instanceof Array) ?
        file.map(obj => obj.filepath) :
        file.filepath
    ctx.body = resolve.json(pathArr, '图片上传成功')
})

module.exports = router