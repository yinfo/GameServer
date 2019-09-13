const modelName = 'ElementType'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const presetSchema = new Schema({
    spells:[{type: Number}]
},{
    autoIndex: false,
    _id: false
})

const modelSchema = new Schema({
    _id: Number,
    name: {
        type: String,
        required: true,
        unique: true
    },
    default_enable: {
        type: Boolean,
        default: true
    },
    // presets:[{_id:Number, spells:[{type: Number}]}]
    presets:[presetSchema],
    bad_spell:[Number],
    medium_spell:[Number],
    good_spell:[Number],


},{
    collection:'element_types'
})

module.exports = mongoose.model(modelName, modelSchema)
