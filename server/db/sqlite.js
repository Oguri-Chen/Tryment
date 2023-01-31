const Database = require("better-sqlite3")
const filePath = './note.db'
const db = new Database(filePath, { verbose: console.log })

createTable = () => {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS T_NOTE (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(256) NULL,
            content TEXT NULL,
            updateDateTime DATETIME NULL
        );
    `
    db.exec(createTableSQL)
}
createTable()

module.exports = db