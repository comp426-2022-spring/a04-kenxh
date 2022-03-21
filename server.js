const { exit } = require('process')
const args = require('minimist')(process.argv.slice(2), { 
    boolean: ['debug', 'log'],
    default: { debug: false, log: true }
})
args['port', 'debug', 'log']
const port = args.port || process.env.PORT || 5555
const debug = args.debug
const log = args.log

if (args.help) {
    console.log('Note that if you try to test this using npx nodemon server.js --help it will display nodemon’s help message. Also, in order for this to work properly, the conditional has to come before all of the dependencies in your script, with the exception of whatever library you are using to parse command line arguments (minimist, yargs, etc.).');
    exit(0);
}

const express = require('express')
const app = express() 

const db = require('./database')

const morgan = require('morgan')
const fs = require('fs')

app.use(express.json())
app.use(express.urlencoded({extended: true}))

const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%', port))
});

app.use((req, res, next) => {
    let logdata = {
        remoteaddr: req.ip,
        remoteuser: req.user,
        time: Date.now(),
        method: req.method,
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        secure: (req.secure) ? 1 : 0,
        status: req.statusCode,
        referer: req.headers['referer'],
        useragent: req.headers['user-agent']
    }
    // console.log(logdata);
    // console.log(Object.values(logdata));
    const stmt = db.prepare('INSERT INTO accesslog (remote_addr, remote_user, time, method, url, protocol, http_version, secure, status, referer, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    stmt.run(Object.values(logdata)) 
    next()
})

if (log) {
    //console.log(log)
    const accessLog = fs.createWriteStream('access.log', { flags: 'a' });
    app.use(morgan('combined', { stream: accessLog }));
}

if (debug) {
    app.get('/app/log/access', (req, res) => {
        try {
            const stmt = db.prepare('SELECT * FROM accesslog').all();
            res.status(200).json(stmt)
        } catch (e) {
            console.error(e)
        }
    });

    app.get('/app/error', (req, res) => {
        throw new Error("Error test successful.")
    });
}