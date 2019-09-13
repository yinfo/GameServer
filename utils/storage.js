const moment = require('moment-timezone')
const MODEL_PATH = '../models/'
// const User = require(MODEL_PATH + 'User')
const ElementType = require(MODEL_PATH + 'ElementType')
// const Character = require(MODEL_PATH + 'Character')
const Spell = require(MODEL_PATH + 'Spell')
const SpellLevels = require(MODEL_PATH + 'SpellLevels')
const GameSettings = require(MODEL_PATH + 'GameSettings')
const sessionStates = require('../models/enums').sessionStates
const keys = require('../config/keys')

const data = {}
const sessions = {}
let spellStartLevels = {}
const folios_settings = {}
let basic_settings
let spell_power_levels
let elementTypesCollection
const bidsMap = new Map()

module.exports.test = () => {

 console.log(this.getSpellPowerByLevel(5))


    // function binaryInsert(value, array, startVal, endVal) {
    //
    //     let length = array.length;
    //     let start = typeof (startVal) != 'undefined' ? startVal : 0;
    //     let end = typeof (endVal) != 'undefined' ? endVal : length - 1;//!! endVal could be 0 don't use || syntax
    //     let m = start + Math.floor((end - start) / 2);
    //
    //     if (length == 0) {
    //         array.push(value);
    //         return;
    //     }
    //
    //     if (value > array[end]) {
    //         array.splice(end + 1, 0, value);
    //         return;
    //     }
    //
    //     if (value < array[start]) {//!!
    //         array.splice(start, 0, value);
    //         return;
    //     }
    //
    //     if (start >= end) {
    //         return;
    //     }
    //
    //     if (value < array[m]) {
    //         binaryInsert(value, array, start, m - 1);
    //         return;
    //     }
    //
    //     if (value > array[m]) {
    //         binaryInsert(value, array, m + 1, end);
    //         return;
    //     }
    //
    //     //we don't insert duplicates [ // мы не вставляем дубликаты]
    // }
    //
    // const dateArr = []
    //
    // const mom1 =moment({
    //     years: '2015', months: '2',
    //     date: '5', hours: '15', minutes: '10', seconds: '3'
    // })
    // const mom2 =moment({
    //     years: '2012', months: '2',
    //     date: '30', hours: '15', minutes: '10', seconds: '3'
    // })
    //
    // const mom3 =moment({
    //     years: '2012', months: '2',
    //     date: '29', hours: '15', minutes: '10', seconds: '3'
    // })
    //
    // const mom4 =moment({
    //     years: '2018', months: '2',
    //     date: '29', hours: '15', minutes: '10', seconds: '3'
    // })
    //
    // const mom5 =moment({
    //     years: '2011', months: '2',
    //     date: '29', hours: '15', minutes: '10', seconds: '3'
    // })
    // binaryInsert(mom1, dateArr)
    // binaryInsert(mom2, dateArr)
    // binaryInsert(mom3, dateArr)
    // binaryInsert(mom4, dateArr)
    // binaryInsert(mom5, dateArr)
    //
    // // let a = [2,7,9]
    // //
    // console.log(JSON.stringify(dateArr))





// // const moment = require('moment-timezone')
// //
//     const t1 = storage.now()
//     const ts1 = t1.valueOf()
//     console.log('now=', t1.format("DD MMM YYYY hh:mm:ss.SSS"))
//     console.log('ts1', ts1)
// //
//     const t2 = storage.now().add(7, 'seconds')
//     const ts2 = t2.valueOf()
//     console.log('now=', t2.format("DD MMM YYYY hh:mm:ss.SSS"))
//     console.log('ts2', ts2)
// //
//     const t3 = storage.now().add(5, 'seconds')
//     const ts3 = t3.valueOf()
//     console.log('now=', t3.format("DD MMM YYYY hh:mm:ss.SSS"))
//     console.log('ts3', ts3)
// //
//     const t4 = storage.now().add(4, 'seconds')
//     const ts4 = t4.valueOf()
//     console.log('now=', t4.format("DD MMM YYYY hh:mm:ss.SSS"))
//     console.log('ts4', ts4)
// //
//     const t5 = storage.now().add(3, 'seconds')
//     const ts5 = t5.valueOf()
//     console.log('now=', t5.format("DD MMM YYYY hh:mm:ss.SSS"))
//     console.log('ts5', ts5)
//
//
//     const obj = {}
//
//
//     obj[ts1] = [1]
//
//     if (obj.hasOwnProperty(ts2)) {
//         obj[ts2].push(2)
//     } else {
//         obj[ts2] = [2]
//     }
//
//     if (obj.hasOwnProperty(ts3)) {
//         obj[ts3].push(3)
//     } else {
//         obj[ts3] = [3]
//     }
//
//     if (obj.hasOwnProperty(ts4)) {
//         obj[ts4].push(4)
//     } else {
//         obj[ts4] = [4]
//     }
//
//     if (obj.hasOwnProperty(ts5)) {
//         obj[ts5].push(5)
//     } else {
//         obj[ts5] = [5]
//     }
//
//     console.log('keys=', Object.getOwnPropertyNames(obj).length)
//     for (let key of Object.(obj)) {
//     // for (let key of Reflect.ownKeys(obj)) {
//         console.log(key,
//             storage.millisecondsToDate(key)
//             // moment.unix(key/1000).format("DD MMM YYYY hh:mm ")
//         )
//     }
// //
//     console.log(JSON.stringify(obj))
//     console.log(JSON.stringify(Object.values(obj)))


}

module.exports.now = function () {


    return moment().add(3, 'hours')
    //  return moment.utc().add(15, 'hours')
    // return moment().format()
}

module.exports.onInit = async () => {
    await createSpells()
    await createElements()
    await createSpellLevels()
    await loadRules()
    if (this.testMode()) {
        this.test()
    }
}

module.exports.updateRules = async function () {

    await loadRules()
}

module.exports.millisecondsToDate = function (milliseconds) {

    return moment.unix(milliseconds / 1000).format("DD MMM YYYY hh:mm:ss.SSS")

    // return moment().format()
    // return moment().format()
}

//Socket Sessions
module.exports.addSession = function (session) {
    sessions[session.sessionId] = session
}

module.exports.removeSession = async function (sessionId) {
    let session = sessions[sessionId]
    if (!session) return false

    // const current_char_Id = session.current_char_Id
    // if (current_char_Id) {
    //      const char = session.user.getCharById(current_char_Id)
    //     if (char) {
    //         storage.cancelBid(session.sessionId, char.level)
    //     }
    // }
    const char = session.currentCharGet()
    if (char) {
        storage.cancelBid(session.sessionId, char.level)
    }

    try {
        session.socket.close()

    } catch (e) {
        console.error('removeSession', e.message)
    }

    //todo а надо ли сохранять юзера при обрыве соединения?
    // try {
    //     const user = session.user
    //     user.last_time = Date.now()
    //     await user.save()
    // } catch (e) {
    //     console.debug('removeSession', 'не смогли обновить timestamp')
    // }

    try {
        session = null
        delete sessions[sessionId]
    } catch (e) {
        console.error('delete sessions[sessionId]', sessionId, e.message)
    }

    console.debug('close - сессий ' + storage.getSessionsLength())
}

module.exports.getSession = function (sessionId) {
    return sessions[sessionId]
}

module.exports.getSessions = function (sessionId) {
    return sessions
}

module.exports.getSessionsLength = function () {
    return Object.keys(sessions).length
}

//Spells
module.exports.getSpellById = function (id) {
    return data.spellsObject[id]
}

module.exports.getSpellParamsById = function (id) {
    try {
        const result = []
        for (let param of data.spellsObject[id].spellParams) {
            result.push(param)
        }
        return result
    } catch (e) {
        return null
    }
}

module.exports.getSpellWithGlamorousAttributes = function (id, spellProgress) {

    if (id === -1) return null
    const spell = data.spellsObject[id]
    return {
        ManaCost: spell.mana_cost,
        LifeTime: spell.life_time,
        Value: spell.value,
        SpellID: spell._id,
        Target: spell.target,
        Locked: spell.lock,
        Level: spellProgress.level,
        ProgressLevel: spellProgress.cur_progress,
        MaxProgressLevel: spellProgress.max_progress,
        ParamType: spell.param_type,
        SpellType: spell.spell_type,
        spellParams: storage.getSpellParamsById(id),
    }
}

module.exports.getSpellWithNormalAttributes = function (id, spellProgress) {

    if (id === -1) return -1
    const spell = data.spellsObject[id]
    return {
        _id: spell._id,
        default_enable: spell.default_enable,
        mana_cost: spell.mana_cost,
        life_time: spell.life_time,
        value: spell.value,
        target: spell.target,
        level: spellProgress.level,
        param_type: spell.param_type,
        spell_type: spell.spell_type,
    }
}

module.exports.getSpellsByElement = function (element) {
    return data.spellsObject['spells_' + element] || []

}

module.exports.getData = function () {
    return data.spellsObject
}

module.exports.getBasicSettings = function (name) {
    return basic_settings[name]
}

module.exports.getSpellsWithStartLevels = function (elementName) {
    return result = this.getSpellsByElement(elementName)
}

module.exports.getMaxProgressOfLevel = function (spellId, level) {


    const levelsConfigName = this.getSpellById(spellId).levelsConfig
    const config = spellStartLevels[levelsConfigName]
    for (let item of config.levels) {
        if (item.level === level) {
            return item.max_progress
        }
    }
}


//Bids
module.exports.findEnemyOrCreateBid = function (session, char) {

    const sessionId = session.sessionId
    const level = char.level
    // session.current_char_Id = char.id

    let enemySession = findEnemyOnLevel(level, sessionId, true)
    if (enemySession) {
        this.cancelBid(sessionId, level)
        return enemySession
    }


    const maximum_level_deviation = storage.getBasicSettings('maximum_level_deviation')
    if (maximum_level_deviation === 0)
        return null

    let additional_lower_level = level
    let additional_upper_level = level
    for (let i = 1; i <= maximum_level_deviation; i++) {

        additional_lower_level--
        if (additional_lower_level > 0) {
            enemySession = findEnemyOnLevel(additional_lower_level, sessionId, false)
            if (enemySession) {
                this.cancelBid(sessionId, level)
                return enemySession
            }
        }

        additional_upper_level++
        enemySession = findEnemyOnLevel(additional_upper_level, sessionId, false)
        if (enemySession) {
            this.cancelBid(sessionId, level)
            return enemySession
        }
    }
    return null
}

function findEnemyOnLevel(level, sessionId, createNew) {

    let arr = bidsMap.get(level)
    if (!arr) {
        if (createNew) {
            arr = []
            arr.push(sessionId)
            bidsMap.set(level, arr)
        }
        return null
    } else if (arr.length === 0) {
        if (createNew) {
            arr.push(sessionId)
        }
        return null
    } else {

        for (const [index, value] of arr.entries()) {
            if (!(value === sessionId)) {
                arr.splice(index, 1)

                return sessions[value]
            }
        }
        return null
    }
}

module.exports.cancelBid = function (sessionId, level) {

    try {
        let arr = bidsMap.get(level)
        for (const [index, value] of arr.entries()) {
            if (value === sessionId) {
                arr.splice(index, 1)
                break
            }
        }
    } catch (e) {
        console.error('cancelBid', e.message)
    }

}

module.exports.getBids = function () {

    return bidsMap
}

module.exports.getSpellPowerByLevel = function (level) {

    try {
        return spell_power_levels[level]
    }catch (e) {
        console.error('getSpellPowerByLevel', 'level=', level)
        return 1
    }

}

module.exports.findOpponentTest = function (session) {

    for (let key of Object.keys(sessions)) {
        if (!(key === session.sessionId)) {
            let cur_session = sessions[key]
            if (cur_session.state === sessionStates.search_for_enemy) {
                return cur_session
            }
        }
    }
    return null
}

module.exports.getFoliosSettings = function (bronze_silver_gold) {

    return folios_settings[bronze_silver_gold]
}

module.exports.getRandomElementTypeName = function () {
    const randomNumber = randomInteger(0, elementTypesCollection.length - 1)
    return elementTypesCollection[randomNumber].name
}

async function createSpells() {

    let spells = await Spell.findOne()
    if (spells) return null

    const arrSpells = [
        {
            _id: 0,
            name: "Fireball",
            type: "plasma",
            spell_type: "active_spell",
            mana_cost: 5,
            life_time: 0,
            param_type: "currentHealth",
            value: -10,
            target: "enemy",
            max_progress: 10,
            cur_progress: 1,
            level: 1,
            levelsConfig: "default"
        },
        {
            _id: 1,
            name: "Meteor",
            type: "plasma",
            spell_type: "active_spell",
            mana_cost: 8,
            life_time: 0,
            param_type: "currentHealth",
            value: -20,
            target: "enemy",
            max_progress: 10,
            level: 1,
            levelsConfig: "default"
        },
        {
            _id: 2,
            name: "Mana regeneration",
            type: "plasma",
            spell_type: "active_spell",
            mana_cost: 7,
            life_time: 5,
            param_type: "currentMana",
            value: 3,
            target: "self",
            max_progress: 10,
            level: 1,
            levelsConfig: "default"
        },
        {
            _id: 3,
            name: "Plus max health",
            type: "plasma",
            spell_type: "spell_parametric",
            mana_cost: 0,
            life_time: 0,
            param_type: "maxHealth",
            value: 50,
            target: "self",
            max_progress: 10,
            level: 1,
            levelsConfig: "default"
        },
        {
            _id: 4,
            name: "Plus max mana",
            type: "plasma",
            spell_type: "spell_parametric",
            mana_cost: 0,
            life_time: 0,
            param_type: "maxMana",
            value: 50,
            target: "self",
            max_progress: 10,
            level: 1,
            levelsConfig: "default"
        }
    ];

    try {
        await Spell.insertMany(arrSpells)
        return true
    } catch (e) {
        console.debug("Spell.insertMany(arrSpells)", e.message)
        return false
    }
}

async function createElements() {
    //первичное заполнение типов элементов
    let elementTypes = await ElementType.findOne()
    if (elementTypes) return null

    const arrElements = [
        {
            _id: 0, name: 'plasma', default_enable: true,
            bad_spell: [0],
            medium_spell: [1, 2],
            good_spell: [3, 4],
            presets: [
                {_id: 0, spells: [0, 1, 2, -1, -1, -1]},
                {_id: 1, spells: [-1, -1, -1, -1, -1, -1]},
                {_id: 2, spells: [-1, -1, -1, -1, -1, -1]},
                {_id: 3, spells: [-1, -1, -1, -1, -1, -1]},
                {_id: 4, spells: [-1, -1, -1, -1, -1, -1]},
                {_id: 5, spells: [-1, -1, -1, -1, -1, -1]},
            ]
        },
        {
            _id: 1, name: 'metal', default_enable: true,
            bad_spell: [0],
            medium_spell: [1, 2],
            good_spell: [3, 4],
            presets: [
                {_id: 0, spells: [-1, -1, -1, -1, -1, -1]},
                {_id: 1, spells: [-1, -1, -1, -1, -1, -1]},
                {_id: 2, spells: [-1, -1, -1, -1, -1, -1]},
                {_id: 3, spells: [-1, -1, -1, -1, -1, -1]},
                {_id: 4, spells: [-1, -1, -1, -1, -1, -1]},
                {_id: 5, spells: [-1, -1, -1, -1, -1, -1]},
            ]
        },
        {
            _id: 2, name: 'water', default_enable: true,
            bad_spell: [0],
            medium_spell: [1, 2],
            good_spell: [3, 4],
            presets: [
                {_id: 0, spells: [-1, -1, -1, -1, -1, -1]},
                {_id: 1, spells: [-1, -1, -1, -1, -1, -1]},
                {_id: 2, spells: [-1, -1, -1, -1, -1, -1]},
                {_id: 3, spells: [-1, -1, -1, -1, -1, -1]},
                {_id: 4, spells: [-1, -1, -1, -1, -1, -1]},
                {_id: 5, spells: [-1, -1, -1, -1, -1, -1]},
            ]
        },
        {
            _id: 3, name: 'sand', default_enable: true,
            bad_spell: [0],
            medium_spell: [1, 2],
            good_spell: [3, 4],
            presets: [
                {_id: 0, spells: [-1, -1, -1, -1, -1, -1]},
                {_id: 1, spells: [-1, -1, -1, -1, -1, -1]},
                {_id: 2, spells: [-1, -1, -1, -1, -1, -1]},
                {_id: 3, spells: [-1, -1, -1, -1, -1, -1]},
                {_id: 4, spells: [-1, -1, -1, -1, -1, -1]},
                {_id: 5, spells: [-1, -1, -1, -1, -1, -1]},
            ]
        },

    ]
    try {
        await ElementType.insertMany(arrElements)
    } catch (e) {
        console.error('createElements', e.message)
    }


}

async function createSpellLevels() {
    let spellSettings = await SpellLevels.findOne()
    if (spellSettings) return false

    const ssElements = [
        {
            _id: 0,
            name: 'default',
            levels: [
                {level: 1, cur_progress: 1, max_progress: 10},
                {level: 2, cur_progress: 1, max_progress: 25},
                {level: 3, cur_progress: 1, max_progress: 45},
                {level: 4, cur_progress: 0, max_progress: 70},
            ]
        }
    ]
    try {
        await SpellLevels.insertMany(ssElements)
    } catch (e) {
        console.error('createSpellLevels', e.message)
    }
}

async function loadRules() {

    //
    const elementTypes = await ElementType.find()
    elementTypesCollection = elementTypes
        .filter(element => element.default_enable)
        .map(element => element.toObject()
        )

    //spellStartLevels -в память по ключу
    const levelsArr = await SpellLevels.find()
    if (levelsArr) {
        const arrayToObject2 = (array) =>
            array.reduce((obj, itemWrap) => {
                let item = itemWrap.toObject()
                obj[item["name"]] = item
                return obj
            }, {})
        spellStartLevels = arrayToObject2(levelsArr)
    }

    //заклинания в память по ключу
    const spellsArr = await Spell.find()
    if (spellsArr) {
        const arrayToObject = (array, keyField) =>
            array.reduce((obj, spellWrap) => {

                let spell = spellWrap.toObject()
                const level_1 = spellStartLevels[spell.levelsConfig].levels[0]
                spell.level = level_1.level
                spell.max_progress = level_1.max_progress
                spell.cur_progress = level_1.cur_progress
                // spell.cur_progress = level_1.cur_progress
                obj[spell[keyField]] = spell
                let spellType = "spells_" + spell.type
                if (!obj[spellType]) {
                    obj[spellType] = []
                }
                obj[spellType].push(spell)

                return obj
            }, {})
        data.spellsObject = arrayToObject(spellsArr, "_id")
    }

    //настройки фолиантов
    let _folios_settings = await GameSettings.findOne({"name": "folios_settings"})
    if (_folios_settings) {
        folios_settings["bronze"] = _folios_settings.data.bronze
        folios_settings["silver"] = _folios_settings.data.silver
        folios_settings["gold"] = _folios_settings.data.gold
    } else {
        console.error('error folios_settings')
    }

    //общие настройки
    let _basic_settings = await GameSettings.findOne({"name": "basic_settings"})
    if (_basic_settings) {
        basic_settings = _basic_settings.data
    } else {
        console.error('error basic_settings')
    }

    //мощность заклинаний по уровням
    let _spell_power_levels = await GameSettings.findOne({"name": "spell_power_levels"})
    if (_spell_power_levels) {
        spell_power_levels = _spell_power_levels.data
    } else {
        console.error('error spell_power_levels')
    }
}

function randomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1)
    rand = Math.round(rand);
    return rand;
}

module.exports.testMode = function () {

    // return true
    return (process.env.HOME === "C:\\Users\\yarovenko") ||
        (process.env.COMPUTERNAME === "DESKTOP-7NN4SRM")
}

this.onInit()







