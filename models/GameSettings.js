const modelName = 'GameSettings'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const modelSchema = new Schema({
    // _id:Number,
    name: {
        type:String,
        unique: true
    },
    data: Schema.Types.Mixed

}, {
    versionKey: false,
    // autoIndex: false,
    collection: 'game_settings',
})

module.exports = mongoose.model(modelName, modelSchema)
// module.exports = mongoose.model(modelName, modelSchema)






