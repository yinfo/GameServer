const modelName =  'Spell'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const modelSchema = new Schema({
    _id:Number,
    name: {
        type: String,
        required: true,
        unique: true
    },
    type:String,
    spell_type:String,
    mana_cost:Number,
    life_time:Number,
    param_type:String,
    value:Number,
    target:String,
    level:Number,
    levelsConfig:{
        type:String,
        default: 'default'
    },
    default_enable: {
        type: Boolean,
        default: false
    },
    spellParams:[Number],
    base_damage_value:Number,


},{versionKey: false})

module.exports = mongoose.model(modelName, modelSchema)
