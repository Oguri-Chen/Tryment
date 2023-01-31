const serverAPP = require('./app/index')
let { APP_PORT } = require('./config/config.default.js')

const onError = (e) => {
    if (e.code === 'EADDRINUSE') serverAPP.listen(++APP_PORT)
}
serverAPP.on('error', onError)

serverAPP.listen(APP_PORT, () => {
    serverAPP.removeListener('error', onError)
}).on('error', onError)

module.exports = {
    APP_PORT,
    serverAPP
}
