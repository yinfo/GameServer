const moment = require('moment')
const MODEL_PATH = '../models/'
const User = require(MODEL_PATH + 'User')
const ElementType = require(MODEL_PATH + 'ElementType')
const Character = require(MODEL_PATH + 'Character')
const Spell = require(MODEL_PATH + 'Spell')

const keys = require('../config/keys')
const errorHandler = require('../utils/errorHTTP')

module.exports.checkSession = async function (req, res, saveUser = true, populate = false) {

    const sessionId = req.body.sessionId
    if (!sessionId) {
        res.status(200).json({
            type: 'error',
            errorId: 'NO_SESSION_ID_SENT',
            message: 'В запросе не указан sessionId'
        })
        return false
    }

    const user = populate
        ? await User.findOne({sessionId})
            .populate({
                path: 'characters.charId'
            })
        : await User.findOne({sessionId})


    if (!user) {
        res.status(200).json({
            type: 'error',
            errorId: 'WRONG_SESSION_ID',
            message: 'sessionId задан неверно!'
        })
        return false
    }

     const newStamp = storage.now()
    // if (!checkStamp(user.last_time, newStamp)) {
    //     res.status(200).json({
    //         type: 'error',
    //         errorId: 'SESSION_EXPIRED',
    //         message: 'Время сессии истекло!'
    //     })
    //     return false
    // }

    user.last_time = newStamp
    if (saveUser) {
        try {
            await user.save()//обновили время, двигаемся дальше
        } catch (e) {
            errorHandler(res, 'TIMESTAMP_UPDATE_ERROR', 'Ошибка БД при обновлении timestamp - ' + e.message)
            return false
        }
    }

    return user
}

module.exports.createUserCharacters = async function (req, res, user) {

    const elementTypes = await ElementType.find()
    const arrCharacters = elementTypes
        .filter(element => element.default_enable)
        .map(element => {

            // const  spells = storage.getSpellsByElement(element.name)
            // const defaultSpells = storage.getSpellsWithStartLevels(element.name)
            // console.log('defaultSpells',JSON.stringify(defaultSpells))
            return {
                level: 1,
                asset_id: 0,
                userName: user.login,
                userLogin: user._id,
                elementType: element.name,
                lock: !element.default_enable,
                selected_preset: 0,
                presets: element.presets,
                spells: storage.getSpellsWithStartLevels(element.name),
                hp_default: storage.getBasicSettings('start_hp'),
                mana_default: storage.getBasicSettings('start_mana')
                // .map((preset, index) => {
                //     console.debug('element.name=',element.name)
                //     console.debug("index=",index)
                //     console.debug(JSON.stringify(preset))
                //
                //     return {
                //         _id: preset.index,
                //         spells: preset.spells
                //     }
                // })
            }
        })

    try {
        // console.log("arrCharacters", JSON.stringify(arrCharacters))
        const characters = await Character.insertMany(arrCharacters)

        user.characters = characters
            .map(char => {
                return {
                    charId: char._id,
                    elementType: char.elementType,
                    lock: char.lock
                }
            })

    } catch (e) {
        // errorHandler(res, 'Character.insertMany', 'Character.insertMany')
        console.debug("await Character.insertMany==", e.message)
        return false
    }


    try {
        return await user.save()
    } catch (e) {
        console.debug("e-userModif=", e.message)
        return false
    }
}

module.exports.getSpellsAsMap = async function (res, excludedFields = {name: 0, type: 0}) {
    try {
        const spellsArr = await Spell.find({}, excludedFields)
        const arrayToObject = (array, keyField) =>
            array.reduce((obj, item) => {
                obj[item[keyField]] = item
                return obj
            }, {})
        const spellsObject = arrayToObject(spellsArr, "_id")
        return spellsObject
    } catch (e) {
        errorHandler(res, '', null, e)
    }
}

module.exports.checkNickName = function (nick, res = null) {
    let message = ''
    let errorId = ''

    if (nick.length === 0) {
        errorId = 'NICK_NAME_CANNOT_BE_EMPTY'
        message = 'Имя игрока не может быть пустым'
    } else {//проверка на длину
        if (nick.length < keys.minUserNameLength) {
            errorId = 'NAME_SHORTER_MIN_LENGTH'
            message = 'Длина имени не может быть меньше ' + keys.minUserNameLength
        } else if (nick.length > keys.maxUserNameLength) {
            errorId = 'NAME_LONGER_MAX_LENGTH'
            message = 'Длина имени не может быть больше ' + keys.maxUserNameLength
        } else {
            //сервер должен проверять, состоит ли имя из допустимых символов.
            // Если есть запрещенные - возвращаться ошибку. Допустимые символы сейчас -
            // латиница обоих регистров, пробел, нижнее подчеркивание, цифры, дефис.
            // const validСharacters ='abcdefghijklmnopqrstuvwxvzABCDEFGHIJKLMNOPQRSTUVWXYZ _0123456789-'

            let rexp = new RegExp(/^[a-zA-Z0-9\s_ -]*$/)
            if (rexp.test(nick)) {
                return true
            }
            else {
                errorId = 'NICK_NAME_CONTAINS_INVALID_CHARACTERS'
                message = 'Допустимые символы - латиница обоих регистров, пробел, нижнее подчеркивание, цифры, дефис'
            }

        }
    }

    if (errorId.length === 0) {//нет ошибок
        return true
    } else {
        if (res) {
            const errObj = {type: 'error', errorId, message}
            console.debug(JSON.stringify(errObj))
            res.status(200).json(errObj)
        }
        return false
    }
}

function checkStamp(oldStamp, newStamp) {
    let delta = (newStamp - oldStamp) / 1000
    if (keys.testMode()) {
        return true
    } else {
        return delta < storage.getBasicSettings('sessionTime')
    }

}

