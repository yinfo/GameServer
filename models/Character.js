const modelName = 'Character'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const {spellParamTypes, errorIds} = require('./enums')
let spellCache


const presetSchema = new Schema({

    spells: [{type: Number}]

}, {autoIndex: false, _id: false})
const spellLevelsSchema = new Schema({

    spellId: Number,
    level: Number,
    cur_progress: Number,
    max_progress: Number,
    _id: false

}, {autoIndex: false, _id: false})
const foliosSchema = new Schema({

    time_length: Number,//время на изучение
    start_time: Number,//время начала изучения
    asset_id: Number,//asset_id
    foliosType: String,
    _id: false

}, {autoIndex: false, _id: false})

const modelSchema = new Schema({
    userLogin: {
        ref: 'User',
        type: Schema.Types.ObjectId
    },
    userName: String,
    elementType: String,
    lock: Boolean,
    selected_preset: Number,
    level: Number,
    asset_id: {
        default: 0,
        type: Number
    },
    presets: [presetSchema],
    spells: [spellLevelsSchema],
    state: {
        type: String,
        default: 'None'
    },//None, Researching, Researched
    time_to_end_study_folios: Date,
    folios: [foliosSchema],
    essences: [{
        _id: false,
        elementType: {type: String},
        slot: Number
    }],

    hp_default: Number,
    hp_max: Number,
    hp_current: Number,
    mana_default: Number,
    mana_max: Number,
    mana_current: Number,

})

modelSchema.methods.regenerateManaTick = function () {

    if (this.mana_max > this.mana_current) {
        this.mana_current++
    }
}

modelSchema.methods.isSpellAvailable = function (spellId) {
    function fillCache(spells) {
        spellCache = {}
        for (let spell of spells) {
            spellCache[spell._id] = spell
        }
    }

    if (!spellCache)
        fillCache(this.spells)
    try {
        return spellCache[spellId].cur_progress > 0
    } catch (e) {
        return false
    }
}

modelSchema.methods.isSpellInSelectedPreset = function (spellId) {

    if ((!this.presets) || this.selected_preset > (this.presets.length - 1)) return false
    const sel_preset_spells = this.presets[this.selected_preset].spells
    for (let value of sel_preset_spells) {
        if (value === spellId)
            return true
    }

    return false
}

modelSchema.methods.clearCache = async function () {

    spellCache = null
}

modelSchema.methods.setPreset = function (presetNew) {
    let err = null
    try {
        const presetIndex = presetNew.Index
        const preset = this.presets[presetIndex]
        preset.spells = presetNew.PresetSpells
    } catch (e) {
        err = {errorId: "ERROR_SET_PRESET", msg: e.message}
    }
    return err
}

modelSchema.methods.setStartParameters = function () {

    this.applySelectedPresetProperties(this.selected_preset)
    this.hp_current = this.hp_max
    this.mana_current = this.mana_max
}

modelSchema.methods.applySelectedPresetProperties = function (selectedPresetIndex) {
    let err = null

    if (selectedPresetIndex > -1 && !(this.selected_preset === selectedPresetIndex)) {
        this.selected_preset = selectedPresetIndex
    }
    try {
        const selectedPreset = this.presets[selectedPresetIndex].toObject()
        let hpBonus = null
        let manaBonus = null
        if (selectedPreset.spells && (selectedPreset.spells.length > 0)) {
            for (let spellId of selectedPreset.spells) {
                let spellObj = storage.getSpellById(spellId)
                if (spellObj) {

                    switch (spellObj.param_type) {
                        case spellParamTypes.maxHealth:
                            hpBonus = spellObj.value
                            break
                        case spellParamTypes.maxMana:
                            manaBonus = spellObj.value
                            break
                    }

                }
            }
        }
        this.hp_max = this.hp_default + (hpBonus ? hpBonus : 0)
        this.hp_current = this.hp_max

        this.mana_max = this.mana_default + (manaBonus ? manaBonus : 0)
        this.mana_current = this.mana_max

    } catch (e) {
        err = {errorId: "ERROR_SET_PRESET", msg: e.message}
    }
    return err
}

modelSchema.methods.updateSpellProgress = function (spellId, spellsAmount, resultTotal) {

    const result = {}

    for (let spell of this.spells) {
        if (spell._id === spellId) {

            const cur_progress = spell.cur_progress
            const new_progress = cur_progress + spellsAmount
            result.progress_old = cur_progress
            result.progress_new = new_progress
            result.level_old = spell.level
            if (new_progress <= spell.max_progress) {
                spell.cur_progress = new_progress
                result.level_new = result.level_old
                result.progress_new = new_progress
                let max_progress = storage.getMaxProgressOfLevel(spellId, result.level_old)
                result.max_progress = max_progress
            } else {
                //переход на новый уровень
                spell.level++
                result.level_new = spell.level

                spell.cur_progress = new_progress - spell.max_progress
                result.progress_new = spell.cur_progress
                //и осталось вытянуть из настроек новый max_progress
                let max_progress = storage.getMaxProgressOfLevel(spellId, spell.level)
                spell.max_progress = max_progress
                result.max_progress = max_progress

                //проверка для возможного перехода персонажа на новый уровень
                const maxLevel = this.spells
                    .reduce((prev, current) => (prev.level > current.level) ? prev : current).level
                if (this.level < maxLevel) {
                    resultTotal.char_level_old = this.level
                    resultTotal.char_level_new = maxLevel
                    this.level = maxLevel
                }

            }
            break
        }
    }
    // return spellCache[spellId].cur_progress > 0
    return result
}

modelSchema.methods.getSpell = function (spellId) {
    for (let spell of this.spells) {
        if (spell._id === spellId) {
            return spell
        }
    }
}

modelSchema.methods.setHpMana = function (hp = null, mana = null) {

    if (hp) {
        hp = Math.min(hp, this.hp_max)
        this.hp_current = hp
        if (hp <= 0)
            return {
                errorId: errorIds.your_hp_is_over,
                errorMsg: 'Ваш уровень жизни меньше нуля',
            }
    }
    if (mana) {
        this.mana_current = Math.min(mana, this.mana_max)
    }
    return null
}

module.exports = mongoose.model(modelName, modelSchema)

















