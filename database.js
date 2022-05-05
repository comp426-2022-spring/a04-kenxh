const Database = require('better-sqlite3')

const logdb = new Database('log.db')

const stmt = logdb.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='accesslog';`)
let row = stmt.get();
if (row === undefined) {
    console.log('Log database appears to be empty. Creating log database...')

    const sqlInit = `
        CREATE TABLE accesslog (
            id INTEGER PRIMARY KEY,
            remote_addr VARCHAR,
            remote_user VARCHAR,
            time VARCHAR, 
            method VARCHAR,
            url VARCHAR,
            protocol VARCHAR,
            http_version NUMERIC,
            secure INTEGER,
            status INTEGER,
            referer VARCHAR,
            user_agent VARCHAR
        );
    `

    logdb.exec(sqlInit);
} else {
    //logdb.exec(`drop table accesslog`)
    console.log('Log database exists.')
}

module.exports = logdb;