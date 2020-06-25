const port = process.env.PORT || 5000
const app = require('./app')
app.listen(port, () => console.log(`HTTP server started  on http://localhost:${port}`))

// const appSocket = require('./whiteboard_server')
// const appSocket = require('./ws_server')
const appSocket = require('./socket_server/server')


