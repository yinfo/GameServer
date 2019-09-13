const bcrypt = require('bcryptjs')
// const moment = require('moment')
const uniqid = require('uniqid')
const errorHandler = require('../utils/errorHTTP')
// const User = require('../models/User')
const MODEL_PATH = '../models/'
const User = require(MODEL_PATH + 'User')

const keys = require('../config/keys')
const shared = require('./shared')

module.exports.its404 = async function (req, res) {

    res.status(404).json({
        type: 'error',
        errorId: 'PAGE_NOT_FOUND',
        message: 'Страница не существует'
    })
}

module.exports.register = async function (req, res) {
    const candidate = await User.findOne({login: req.body.login})
    if (candidate) {
        errorHandler(res, 'LOGIN_ALREADY_EXISTS', 'Такой login уже занят ')
    } else {
        const salt = bcrypt.genSaltSync(10)
        const password = req.body.password
        const login = req.body.login
        const user = new User({
            login: login,
            nick_name: login,
            password: bcrypt.hashSync(password, salt),
            level: 1,
            sessionId: uniqid(),
            last_time: storage.now()
        })

        try {
            await user.save()
        } catch (e) {
            try {
                Error.save(e, {
                    login: user.login
                })
                errorHandler(res, 'DATA_BASE_WRITE_ERROR', '', e)
                user.remove()
            } catch (e) {
                Error.save(e, {
                    login: user.login
                })
            }
        }

        try {
            let userWithChars = await shared.createUserCharacters(req, res, user)
            if (userWithChars) {
                res.status(201).json({
                    type: 'valid-response',
                    sessionId: user.sessionId,
                    login: user.login,
                    nick_name: user.nick_name,
                    level: user.level,
                    tutorial_completed: user.tutorial_completed,
                    message: 'Пользователь успешно создан'
                })
            } else {
                errorHandler(res, 'DATA_BASE_WRITE_ERROR')
            }
        } catch (e) {
            Error.save(e)
            errorHandler(res, '', '', e)
        }
    }
}

module.exports.login = async function (req, res) {

    const login = req.body.login
    const password = req.body.password

    const user = await User.findOne({login})
    if (user) {
        const passwordResult = bcrypt.compareSync(password, user.password)
        if (passwordResult) { // пароли совпали
            const sessionId = uniqid()
            user.last_time = storage.now()
            user.sessionId = sessionId
            try {
                await user.save()
                res.status(200).json({//HTTP запрос
                    type: 'valid-response',
                    sessionId,
                    login: user.login,
                    nick_name: user.nick_name,
                    level: user.level,
                    tutorial_completed: user.tutorial_completed,
                    maxUserNameLength: keys.maxUserNameLength,
                    minUserNameLength: keys.minUserNameLength,
                })
            } catch (e) {
                Error.save(e, {
                    login: user.login
                })
                errorHandler(res, 'DATA_BASE_WRITE_ERROR', null, e)
            }
        } else {
            errorHandler(res, 'WRONG_PASSWORD', 'Неправильный пароль')
        }
    } else {
        errorHandler(res, 'USER_NOT_EXIST', 'Неправильный login')
    }
}

module.exports.logout = async function (req, res) {

    try {
        const user = await shared.checkSession(req, res, false)
        const null_date = new Date(0)
        user.last_time = null_date
        await user.save()
        res.status(201).json({
            type: 'valid-response',
            sessionId: user.sessionId,
            message: 'Вы успешно разлогинились'
        })
    } catch (e) {
        Error.save(e, {
            login: user.login
        })
        res.status(200).json({
            type: 'error',
            errorId: 'TIMESTAMP_UPDATE_ERROR',
            message: 'Ошибка БД при обновлении timestamp - ' + e.message
        })
    }
}

module.exports.changeNickName = async function (req, res) {
    const user = await shared.checkSession(req, res, false)
    if (!user) return false

    const newNick = req.body.newNick
    if (!shared.checkNickName(newNick, res)) return false

    const oldNick = user.nick_name
    user.nick_name = newNick
    try {
        await user.save()
        res.status(200).json({
            type: 'valid-response',
            message: 'Вы успешно изменили nick-name',
            oldNick,
            newNick,
            tutorial_completed: user.tutorial_completed

        })
    } catch (e) {
        if (e.code === 11000) {
            res.status(200).json({
                type: 'error',
                errorId: 'NICK_ALREADY_EXISTS',
                message: 'Такой ник уже занят'
            })
        } else {
            Error.save(e, {
                login: user.login
            })
            errorHandler(res, 'DATA_BASE_WRITE_ERROR', '', e)
        }
    }
}

module.exports.tutorialCompleted = async function (req, res) {

    try {
        const user = await shared.checkSession(req, res, false)
        user.tutorial_completed = true
        await user.save()
        res.status(201).json({
            type: 'valid-response',
            message: 'TutorialCompleted = true'
        })
    } catch (e) {
        Error.save(e, {
            login: user.login
        })
        errorHandler(res, 'DATA_BASE_WRITE_ERROR', 'tutorialCompleted Ошибка при записи пользователя в БД ')

    }
}
//список персонажей по sessionId
module.exports.getChars = async function (req, res) {
    try {
        const user = await shared.checkSession(req, res, false, true)
        if (!user) return false// в checkSession уже отправили ошибку клиенту

        const characters = user.characters
            .map(char => {
                const charObj = char.charId

                //время до конца изучения фолианта
                let seconds_to_end
                let state
                if (charObj.state === 'None' || charObj.state === 'Researched') {
                    seconds_to_end = 0
                    state = charObj.state
                } else {
                    seconds_to_end = Math.round((charObj.time_to_end_study_folios - storage.now()) / 1000)
                    if (seconds_to_end <= 0) {
                        state = 'Researched'
                        char.state = state
                        seconds_to_end = 0
                    } else {
                        state = 'Researching'
                    }
                }

                return {

                    elementType: charObj.elementType,
                    lock: charObj.lock,
                    selected_preset: charObj.selected_preset,
                    level: charObj.level,
                    asset_id: charObj.asset_id,
                    charId: charObj._id,
                    state: state,
                    seconds_to_end: seconds_to_end,
                    folios: charObj.folios
                        .map(folio => {
                            return {
                                state: folio.state,
                                asset_id: folio.asset_id,
                                foliosType: folio.foliosType
                            }
                        }),
                    essences: charObj.essences
                        .map(ess => {
                            return {
                                elementType: ess.elementType,
                                slot: ess.slot
                            }
                        })
                }
            })

        res.status(200).json({
            type: 'valid-response',
            userEssences: user.toObject().essences,
            characters
        })
    } catch (e) {
        Error.save(e, {
            login: user.login
        })
        errorHandler(res, '', '', e)
    }
}
//выбранные пресеты по всем разблокированным персонажам
module.exports.getSelectedPresets = async function (req, res) {
    try {
        const user = await shared.checkSession(req, res, false, true)
        // const spellsMap = await shared.getSpellsAsMap(res)

        const presets = user.characters
            .filter(char => !char.charId.lock)
            .map(char => {
                const charObj = char.charId
                const selected_preset_index = charObj.selected_preset
                const selected_preset = charObj.presets[selected_preset_index]

                const spells = selected_preset.spells
                    .map(spell => {
                            const spellProgress = charObj.getSpell(spell)
                            return storage.getSpellWithNormalAttributes(spell, spellProgress)
                        }
                    )
                // return spell === -1 ? -1 : spellsMap[spell]})
                return {
                    charId: charObj._id,
                    // selected_preset_index:selected_preset_index,
                    elementType: charObj.elementType,
                    lock: charObj.lock,
                    spells: spells
                }
            })

        res.status(200).json({
            type: 'valid-response',
            message: 'выбранные пресеты по  разблокированным персонажам',
            presets: presets
        })
    } catch (e) {
        Error.save(e, {
            login: user.login
        })
        errorHandler(res, '', '', e)
    }
}
//Книга заклинаний
module.exports.getSpellBook = async function (req, res) {

    try {
        const user = await shared.checkSession(req, res, false, true)
        const elType = req.body.element_type
        const elements = user.characters
            .filter(char => {
                if (elType) {
                    return ((char.elementType === elType) && !char.lock)
                } else {
                    return !char.lock
                }
            })
            .map(char => {
                const charObj = char.charId
                return {
                    ID: charObj._id,
                    Locked: charObj.lock,
                    elementType: charObj.elementType,
                    // asset_id: charId.asset_id,
                    selected_preset: charObj.selected_preset,

                    Spells: storage.getSpellsByElement(charObj.elementType)
                        .map(spell => {
                            const spellProgress = charObj.getSpell(spell._id)
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
                            }
                        }),
                    Presets: char.charId.presets
                        .map((preset, index) => {
                            preset.Index = index
                            return preset
                        })
                        .map((preset, index) => {
                            return {
                                Selected: index === charObj.selected_preset,
                                // Index: preset.Index,
                                Index: index,
                                PresetSpells: preset.spells
                                //todo ошибка пустые может не фильтровать?
                                //       .filter(spell => !(spell === -1))
                                    .map((spell, index) => {
                                        // if (spell===-1){
                                        //     return {}
                                        // }else{
                                        const spellProgress = charObj.getSpell(spell)
                                        return {
                                            Index: index,
                                            Spell: storage.getSpellWithGlamorousAttributes(spell, spellProgress)
                                        }
                                        // }

                                    })
                            }
                        })
                }
            })

        res.status(200).json({
            type: 'valid-response'
            // ,user
            , Elements: elements
        })
    } catch (e) {
        Error.save(e, {
            login: user.login
        })
        errorHandler(res, '', '', e)
    }
}
//getSelectedPresets
module.exports.SelectedPresets = async function (req, res) {

    try {
        const user = await shared.checkSession(req, res, false, true)
        const elements = user.characters
            .filter(char => !char.lock)
            .map(charTemp => {
                const character = charTemp.charId
                const character_presets =  character.presets.toObject() || []

                let Presets = []
                if (character_presets.length > 0) {
                    Presets = character_presets
                        .map((preset, index) => {

                            // if (index===0){
                            //     console.debug(JSON.stringify(preset ))
                            // }


                            return {
                                Selected: index === character.selected_preset ,
                                Index: index,
                                PresetSpells: preset.spells
                                    .map((spell, index) => {
                                        const spellProgress = character.getSpell(spell)
                                        return {
                                            Index: index,
                                            Spell: spell === -1 ? null : storage.getSpellWithGlamorousAttributes(spell, spellProgress)
                                        }
                                    })
                            }
                        })
                        .filter(preset => preset.Selected)
                }

                return {
                    ID: character._id,
                    Locked: character.lock,
                    elementType: character.elementType,
                    // asset_id: character.asset_id,
                    selected_preset: character.selected_preset,
                    Presets,

                }
            })

        res.status(200).json({
            type: 'valid-response'
            // ,user
            , Elements: elements
        })
    } catch (e) {
        Error.save(e, {
            login: user.login
        })
        errorHandler(res, '', '', e)
    }
}
























