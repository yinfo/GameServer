const port = 8080
const WebSocketServer = require('./index').Server
const express = require('express')
const path = require('path')
const app = express()
const server = require('http').createServer()

app.use(express.static(path.join(__dirname, '/public')))

const socketController = require('../controllers/socket')
const wss = new WebSocketServer({server: server})
const url = require('url')

wss.on('connection', (socket, req) => {

    const url_parts = url.parse(req.url, true)
    if (!url_parts.query || !url_parts.query.session_id){
        socket.send(JSON.stringify({
            'errorId': 'MISSING_SESSION_ID',
        }))
        socket.close()
        return false
    }
    if (!socketController.onConnection(socket, url_parts.query.session_id)){
        socket.send(JSON.stringify({
            'errorId': 'WRONG_SESSION_ID',
        }))
        socket.close()
        return false
    }

    socket.on('message', (message) => {
        try {
            const command = JSON.parse(message)
            socketController.onMessage(socket, command)
        }
        catch (e) {
            socket.send(JSON.stringify({
                'errorId': 'INCORRECT_JSON_FORMAT',
                'msg': e.message,
            }))
        }
    });

    socket.on('close', () =>
        socketController.onClosing(socket))
})

server.on('request', app)
server.listen(port, () => {
    console.log(`Socket server on http://localhost:${port}`)
})









