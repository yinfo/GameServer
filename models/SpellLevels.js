const modelName = 'SpellLevels'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const modelSchema = new Schema({
    _id:Number,
    name: String,
    levels: [{
        level: Number,
        cur_progress: Number,
        max_progress: Number,
        _id:false
    }]

}, {
    versionKey: false,
    autoIndex: false,
    collection: 'spell_levels',
})

module.exports = mongoose.model(modelName, modelSchema)
// module.exports = mongoose.model(modelName, modelSchema)






