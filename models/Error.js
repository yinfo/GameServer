const modelName = 'Error'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
// const moment = require('moment-timezone')

const modelSchema = new Schema({
    // _id:Number,
    time: Date,
    message: String,
    name: String,
    stack_info: String,
    command: Schema.Types.Mixed,
    is_local_server: Boolean,

}, {
    versionKey: false,
})

modelSchema.statics.save = function (e, command = null) {
    try {
        const newError = new this()
        newError.time = storage.now()
        newError.message = e.message
        newError.name = e.name
        try {
            newError.stack_info = e.stack.split('\\n')[0]
        } catch (e) {
        }
        newError.command = command
        newError.is_local_server = storage.testMode()
        newError.save()
    }catch (e) {
        console.error('class Error modelSchema.statics.save', e.message)
    }
}

module.exports = mongoose.model(modelName, modelSchema)






