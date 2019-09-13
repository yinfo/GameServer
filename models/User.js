const modelName = 'User'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// const MODEL_PATH = '../models/'
// const Character = require(MODEL_PATH + 'Character')

const modelSchema = new Schema({
    login: {
        type: String,
        required: true,
        unique: true
    },
    nick_name: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        default: 1
    },
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    last_time: {
        type: Date
    },
    tutorial_completed: {
        type: Boolean,
        default: false
    },
    characters: [{
        _id: false,
        charId: {ref: 'Character', type: Schema.Types.ObjectId},
        elementType: {type: String},
        lock: Boolean
    }],
    essences:[{
        _id: false,
        elementType: {type: String},
        amount:Number
    }]
})

modelSchema.methods.getCharByType = function (charType) {

    const arrayLength = this.characters.length
    if (arrayLength) {
        for (let i = 0; i < arrayLength; i++) {
            let char = this.characters[i]
            if (char.elementType === charType) {
                return char.charId
            }
        }
    }
    return null
}

modelSchema.methods.getCharById = function (charId) {

    const arrayLength = this.characters.length
    if (arrayLength) {
        for (let i = 0; i < arrayLength; i++) {
            let char = this.characters[i].charId
            if (char._id.equals(charId)) {
                return char
            }
        }
    }else {
        console.error('char_not_found', this.login, 'charId=', charId)
        return null
    }
}

modelSchema.methods.addEssence = function (prize) {

    const elementType = prize.elementType
    const amount = prize.amount

    const foundedEssence = this.essences.find(ess => {
        return ess.elementType === elementType
    })

    if (foundedEssence){
        foundedEssence.amount = foundedEssence.amount + amount
    }else{
        this.essences.push({elementType, amount})
    }
}

modelSchema.methods.getEssences = function () {

    return this.essences

}

module.exports = mongoose.model(modelName, modelSchema)


