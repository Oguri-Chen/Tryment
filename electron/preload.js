const path = require('path');
const { APP_PORT } = require(path.join(__dirname, '../server/main'))

window.electron = require('electron')
window.port = APP_PORT