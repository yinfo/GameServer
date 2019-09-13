const express = require('express')
const app = express()
const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true)
const bodyParser = require('body-parser')

const path = require('path')
const publicPath = path.join(__dirname, 'public')
const logPath = path.join(__dirname, './public/log.html')

const mainRoute = require('./routes/api')
const adminRoutes = require('./routes/admin')

const keys = require('./config/keys')
global.storage = require('./utils/storage')
// global.redis = require('./utils/redis')

//todo no for production
if (!keys.testMode()) {
    mongoose.connect(keys.mongoURI, {useNewUrlParser: true})
        .then(() => console.log('MongoDB connected on '+ keys.mongoURI))
        .catch(error => {
            console.log('MongoDB local server don not work' && error.message)
        })
} else {
    mongoose.connect(keys.mongoURItest, {useNewUrlParser: true})
        .then(() => console.log('MongoDB connected on ' + keys.mongoURItest))
        .catch(error => {
            console.log('MongoDB test server don not work' && error.message)
        })
}

app.use(express.static(publicPath))
app.use(express.static(logPath))
app.use(require('morgan')(':date[iso] :method :url'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(require('cors')())

app.use('/api', mainRoute) //API
app.use('/admin', adminRoutes)//администрирование

app.all('*', mainRoute) //ловим 404
module.exports = app
