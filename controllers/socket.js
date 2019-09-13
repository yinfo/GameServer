const uniqid = require('uniqid')
const moment = require('moment')

const MODEL_PATH = '../models/'
const User = require(MODEL_PATH + 'User')
const SocketSession = require(MODEL_PATH + 'SocketSession')
const Error = require(MODEL_PATH + 'Error')
const ElementType = require(MODEL_PATH + 'ElementType')

const keys = require('../config/keys')
const {sessionStates, hitStatuses, errorIds} = require('../models/enums')


// const sizeof = require('object-sizeof')
// console.debug('размер сокета ' + sizeof(socket))

module.exports.onConnection = function (socket, sessionId) {

    const session = checkSession(socket, {sessionId})
    if (!session)
        return false

    socket.uid = uniqid()
    // socket.send(JSON.stringify({
    //     type: 'valid-response',
    //     msg: 'соединение установлено',
    //     state: sessionStates.undef,
    // }))
    sendSuccess(socket, null, {
        msg: 'соединение установлено!',
        state: sessionStates.opened,
    })

    return true
}

module.exports.onMessage = async function (socket, command) {
    try {
        if (command.uid)
            socket.__uid = command.uid
        if (!command.scr)
            return sendErr(socket, 'SCR_MISSING', 'Отсутствует поле scr - имя скрипта')

        if (command.scr === 'delay') {
            delay(socket, command)
            return false
        }

        const session = await checkSession(socket, command)
        if (!session) return false

        switch (command.scr.toLowerCase()) {
            case 'getuser':
                sendSuccess(socket, command, {user: session.user})
                break
            case 'changenick':
                changeNick(socket, command, session)
                break
            case 'presetchange':
                presetChange(socket, command, session)
                break
            case 'create_bid':
                create_bid(socket, command, session)
                break
            case 'cancel_bid':
                cancel_bid(socket, command, session)
                break
            case 'createfolio':
                createFolio(socket, command, session)
                break
            case 'startlearningfolios':
                startLearningFolios(socket, command, session)
                break
            case 'unzipfolios':
                unzipFolios(socket, command, session)
                break
            case 'essence_from_user_to_char':
                essence_from_user_to_char(socket, command, session)
                break
            case 'text_message':
                text_message(socket, command, session)
                break
            case 'start_battle':
                start_battle(socket, command, session)
                break
            case 'spell_start':
                spell_start(socket, command, session)
                break
            case 'spell_step':
                spell_step(socket, command, session)
                break


            default:
                return sendErr(socket, 'UNRECOGNIZED_COMMAND', 'unrecognized command type ' + command.scr)
        }
    } catch (e) {
        Error.save(e, command)
    }
}

module.exports.onClosing = function (socket) {

    const sessionId = socket.sessionId
    const session = storage.getSession(sessionId)
    if (session) {

        session.cancel_all_timers()
        const enemySession = storage.getSession(session.enemySessionId)
        if (enemySession) {
            enemySession.cancel_all_timers()

            if (enemySession.state === sessionStates.start_battle_success
                || enemySession.state === sessionStates.battle_wait
                || enemySession.state === sessionStates.battle_active) {
                try {
                    victory(enemySession)
                } catch (e) {
                    // logicError('Не смогли поздравить с победой onClosing', e.message)
                    Error.save(e, {sessionId})
                }
            }
        }

        storage.removeSession(sessionId)
    }
}

function sendErr(socket, errorId, msg = null, session = null) {
    msg = msg ? msg : errorId
    const uid = socket.__uid

    try {
        const resObj = {uid, errorId, msg}
        if (session) {
            resObj.state = session.state
        }
        socket.send(JSON.stringify(resObj))
    } catch (e) {
        console.debug('send_err', e.message)
    }
    // if(session)
    //     session.history_add({
    //         errorId,
    //         msg,
    //     })
    return false
}

function sendSuccess(socket, command = null, data = {}) {

    if (!command) command = {scr: '', uid: ''}

    data.type = "valid-response"
    if (command.scr)
        data.scr = command.scr
    if (command.uid)
        data.uid = command.uid

    // if(session && command)
    //     session.history_add(command)

    socket.send(JSON.stringify(data))
    return true
}

function logicError(errorId = '', msg = '') {
    console.error('logicError', errorId, msg)
    return false
    // logicError('ERROR_CHAR_SAVE_presetChange', e.message)
}

function delay(socket, command) {

    let time = command.time
    setTimeout(function () {
        sendSuccess(socket, command, command)
    }, time * 1000);

}

async function checkSession(socket, command) {
    let sessionId = command.sessionId
    if (!sessionId)
        return sendErr(socket, "MISSING_SESSION_ID", "checkSession")

    let session = storage.getSession(sessionId)
    if (session && socket.uid === session.socket.uid) {//сокет сессия найдена и она актуальна

        session.last_time = storage.now()

        return session
    } else {//сокет сессия должна быть создана
        const user = await User.findOne({sessionId}).populate({path: 'characters.charId'})
        if (user) {
            // if (storage.getSession(user.sessionId))
            //     console.error('старая сессия висит!?')

            //todo  if(!(command.test_mode)){
            //     const newStamp = storage.now()
            //     if (!checkStamp(user.last_time, newStamp)) {
            //         return send_err(socket, 'SESSION_EXPIRED', 'Время сессии истекло ')
            //     }
            // }
            if (!checkStamp(user.last_time)) {
                return sendErr(socket, 'SESSION_EXPIRED', 'Время сессии истекло')
            }

            session = new SocketSession(socket, sessionId, user)
            storage.addSession(session)
            return session
        } else {
            return sendErr(socket, 'WRONG_SESSION_ID', 'sessionId задан неверно')
        }
    }
}

function checkStamp(oldStamp) {

    let delta = (moment().diff(oldStamp)) / 1000
    if (keys.testMode()) {
        return true
    } else {
        return delta < storage.getBasicSettings('sessionTime')
    }
}

async function changeNick(socket, command, session) {
    console.log('command', JSON.stringify(command))
    const user = session.user
    user.nick_name = command.newNick
    user.last_time = storage.now()
    try {
        await user.save()
    } catch (e) {
        socket.send('Не смогли изменить ник')
        sendErr(socket, 'changeNick_error', e.message)
    }
}

async function presetChange(socket, command, session) {

    const char = session.user.getCharById(command.charId) // console.log('char',JSON.stringify(char))
    if (!char)
        return sendErr(socket, "wrong_charId", "Не удалось найти персонаж по charId:" + command.charId)
    const elementType = char.elementType

    let countSelectedPresets = 0
    let selectedPresetIndex = -1
    let selectedPresetArray = []
    let max_spells_in_preset = storage.getBasicSettings("max_spells_in_preset")

    for (let preset of command.Presets) { // console.debug('preset', JSON.stringify(preset))

        if (preset.Selected) {
            countSelectedPresets++
            selectedPresetIndex = preset.Index
            selectedPresetArray = preset
        }
        if (countSelectedPresets > 1)
            return sendErr(socket, "more_than_one_selected_presets", "more_than_one_selected_presets")

        if (preset.PresetSpells.length > max_spells_in_preset)
            return sendErr(socket, 'max_spells_in_preset', 'max_spells_in_preset=' + max_spells_in_preset)

        const duplicateSpells = {}
        for (let spellId of preset.PresetSpells) {
            if (spellId > -1) {
                if (duplicateSpells[spellId]) {
                    return sendErr(socket, "Duplicate_Spells", "Duplicate spells in preset Index=" + preset.Index)
                } else {
                    duplicateSpells[spellId] = true
                }

                let spellObj = storage.getSpellById(spellId)
                if (spellObj) {
                    if (!(spellObj.type === elementType)) {
                        return sendErr(socket, "WRONG_SPELL_TYPE", "Type of spellId " + spellId + " not " + elementType)
                    }


                    if (!char.isSpellAvailable(spellId)) {
                        // char.clearCache()
                        return sendErr(socket, "SPELL_NOT_AVAILABLE", "spellId=" + spellId + " not available")
                    }

                } else {
                    return sendErr(socket, "WRONG_SPELL_ID", "WRONG_SPELL_ID " + spellId)
                }
            }
        }
        //
        let err = char.setPreset(preset)
        if (err) {
            return sendErr(socket, err.errorId, err.msg)
        }
    }

    try {
        char.applySelectedPresetProperties(selectedPresetIndex)
        char.clearCache()
        char.save()
    } catch (e) {
        // logicError('ERROR_CHAR_SAVE_presetChange', e.message)
        Error.save(e, command)
        return sendErr(socket, 'ERROR_CHAR_SAVE', e.message)
    }
    sendSuccess(socket, command, {
        PlayerData: {
            hp: char.hp_current,
            mana: char.mana_current,
        }
    }, session)
}

//Создание фолианта.
async function createFolio(socket, command, session) {
    const char = session.user.getCharById(command.charId) // console.log('char',JSON.stringify(char))
    if (!char)
        return sendErr(socket, "wrong_charId", "Не удалось найти персонаж по charId:" + command.charId)

    if (char.folios.length > 2) {
        return sendErr(socket, "reach_max_number_of_folios", "у персонажа уже есть 3 фолианта")
    }

    // const elementType = char.elementType
    const foliosType = getRandomFoliosType()
    const foliosSettings = storage.getFoliosSettings(foliosType)
    const newFolio = {
        state: "None",
        time_length: storage.getBasicSettings('folios_time_length'),
        start_time: 0,//время начала изучения
        asset_id: foliosSettings.AssetID,//asset_id
        foliosType: foliosType,
    }

    char.folios.push(newFolio)
    try {
        await char.save()
        sendSuccess(socket, command, {
            msg: "New folio was added!",
            foliosType,
        }, session)
    } catch (e) {
        // logicError("error_add_folio_createFolio", "Ошибка при создании фолианта" + e.message)
        Error.save(e, command)
        sendErr(socket, "error_add_folio_createFolio", "Ошибка при создании фолианта" + e.message)
    }

}

function getRandomFoliosType() {
    let arr = ["bronze", "silver", "gold"]

    let rand = Math.floor(Math.random() * arr.length)

    return arr[rand]
}

//Запрос на изучение фолиантов
async function startLearningFolios(socket, command, session) {
    const char = session.user.getCharById(command.charId)
    if (!char)
        return sendErr(socket, "wrong_charId", "Не удалось найти персонаж по charId:" + command.charId)

    if (char.folios.length === 0)
        return sendErr(socket, "folios_missing", "Фолианты отсутствуют")

    if (char.state === 'Researching') {
        const seconds_to_end = Math.round((char.time_to_end_study_folios - storage.now()) / 1000)

        if (seconds_to_end > 0) {
            return sendErr(socket, "seconds_to_finish_learning", seconds_to_end)
        } else {
            try {
                char.state = 'Researched'
                await char.save()
                return sendErr(socket, "folio_study_is_active", "Фолианты изучены, но не распакованы")
            } catch (e) {
                // logicError('char.save()_startLearningFolios', e.message)
                Error.save(e, command)
            }
        }
    }

    try {
        char.state = 'Researching'
        const time_to_end = storage.getBasicSettings("folios_time_length")
        char.time_to_end_study_folios = storage.now() + time_to_end * 1000
        await char.save()
        sendSuccess(socket, command, {
            time_to_end
        }, session)
    } catch (e) {
        // logicError("startLearningFolios", e.message)
        Error.save(e, command)
        return sendErr(socket, "startLearningFolios", e.message)
    }
}

//Запрос на распаковку фолиантов
async function unzipFolios(socket, command, session) {
    const user = session.user
    const char = user.getCharById(command.charId)
    if (!char)
        return sendErr(socket, "wrong_charId", "Не удалось найти персонаж по charId:" + command.charId)

    if (char.folios.length === 0)
        return sendErr(socket, "folios_missing", "Фолианты отсутствуют")

    if (char.state === 'Researching') {
        const seconds_to_end = Math.round((char.time_to_end_study_folios - storage.now()) / 1000)
        if (seconds_to_end > 0) {
            return sendErr(socket, "seconds_to_finish_learning", seconds_to_end)
        } else {
            char.state = 'Researched'
        }
    }
    if (char.state === 'Researched') {

        const elementProps = await ElementType.findOne({"name": char.elementType})
        //открываем фолиант по индексу 0, результат складываем в total_result
        let folio_result = await unzipOneFolio(char.folios[0], elementProps, char, user)
        if (!folio_result) return sendErr(socket, 'failed_to_unpack_folio', 'Не удалось распаковать фолиант')


        if (!(command.test)) {//если не тестовый, а обычный режим - удаляем фолиант
            if (char.folios.length === 1) {
                char.state = 'None'
                char.folios = []
            } else {
                char.folios.splice(0, 1)
            }
        }

        try {
            await char.save()
        } catch (e) {
            // logicError("char.save()_unzipFolios", e.message)
            Error.save(e, command)
            return sendErr(socket, "char.save()_unzipFolios", e.message)
        }

        return sendSuccess(socket, command, folio_result, session)
        // }
    } else {
        return sendErr(socket, "there_was_no_command_to_study_folios", "Изучение фолиантов не было активировано")
    }
}

async function unzipOneFolio(folio, elementProps, char, user) {

    let result = {}

    const foliosType = folio.foliosType
    result.elementType = foliosType

    let folio_settings = storage.getFoliosSettings(foliosType)
    let prizes_count = randomInteger(folio_settings.min_prizes, folio_settings.max_prizes)
    result.prizes_count = prizes_count
    result.prizes = []

    let group_sum = 0
    let prizes = folio_settings.prizes
    let prizesKeys = Object.keys(prizes)
    for (let i = 0; i < prizesKeys.length; i++) {
        group_sum = group_sum + prizes[prizesKeys[i]]
    }
    for (let j = 0; j < prizes_count; j++) {
        let prize = {}
        let control = randomInteger(0, group_sum)

        let new_sum = 0
        let prize_group
        for (let i = 0; i < prizesKeys.length; i++) {
            new_sum = new_sum + prizes[prizesKeys[i]]
            if (new_sum >= control) {
                prize_group = prizesKeys[i]
                break
            }
        }
        prize.group = prize_group

        if (prize_group === 'bad_spell' || prize_group === 'medium_spell' || prize_group === 'good_spell') {
            //заклинания
            prize.type = 'spell'

            let spellId = get_random_spell_from_group(prize_group, elementProps)
            if (!(spellId > -1)) return false


            prize.spellId = spellId
            prize.spellsAmount = get_random_spells_amount(folio_settings)
            prize.changes = char.updateSpellProgress(spellId, prize.spellsAmount, result)

            result.prizes.push(prize)
        } else if (prize_group === 'bad_essence' || prize_group === 'medium_essence' || prize_group === 'good_essence') {
            //эсенции
            prize.type = 'essence'

            prize.elementType = storage.getRandomElementTypeName()
            prize.amount = get_random_essence_amount(folio_settings)
            result.prizes.push(prize)

            try {
                user.addEssence(prize)
                await user.save()
            } catch (e) {
                // logicError('user.save()_unzipOneFolio', e.message)
                Error.save(e, {
                    login: user.login,
                })
            }

        } else {
            //золото
            prize.type = 'gold'
            // return addGoldAfterVictory(session,char,socket)
        }
    }
    return result
}

function get_random_spell_from_group(prize_group, elementProps) {

    let spellsGroup = elementProps[prize_group]
    if (spellsGroup.length === 0) {
        return -1
    } else if (spellsGroup.length === 1) {
        return spellsGroup[0]
    } else {
        return spellsGroup[randomInteger(0, spellsGroup.length - 1)]
    }
}

function get_random_spells_amount(folio_settings) {
    const stringValue = get_random_value_from_weight_list(folio_settings.spells_amount)
    return Number(stringValue)
}

function get_random_essence_amount(folio_settings) {
    const stringValue = get_random_value_from_weight_list(folio_settings.essences_amount)
    return Number(stringValue)
}

function get_random_value_from_weight_list(list) {
    let group_sum = 0
    let listKeys = Object.keys(list)
    for (let i = 0; i < listKeys.length; i++) {
        group_sum = group_sum + list[listKeys[i]]
    }
    let control = randomInteger(0, group_sum)

    let new_sum = 0
    let result
    for (let i = 0; i < listKeys.length; i++) {
        new_sum = new_sum + list[listKeys[i]]
        if (new_sum >= control) {
            result = listKeys[i]
            break
        }
    }

    return result
}

function randomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1)
    rand = Math.round(rand);
    return rand;
}

//эссенцию от юзера в поясную сумку
async function essence_from_user_to_char(socket, command, session) {
    const user = session.user
    const char = user.getCharById(command.charId) // console.log('char',JSON.stringify(char))
    if (!char)
        return sendErr(socket, "wrong_charId", "Не удалось найти персонаж по charId:" + command.charId)


    const elementType = command.elementType
    if (!elementType)
        return sendErr(socket, "missing_elementType", "Не указан elementType")

    const slot = command.slot
    if (!(Number.isInteger(slot) && slot >= 0 && slot <= 4))
        return sendErr(socket, "wrong_slot", "slot должен быть от 0 до 4")


    const essenceElementUser = await user.essences
        .find(elem => {
            return elem.elementType === elementType
        })
    if (!essenceElementUser)
        return sendErr(socket, "missing_essence", "У игрока отсутствует эссенция типа " + elementType)


    const current_amount = essenceElementUser.amount
    if (current_amount <= 0)
        return sendErr(socket, "missing_essence", "У игрока отсутствует эссенция типа " + elementType)

    essenceElementUser.amount = current_amount - 1

    let essenceElementChar
    for (let essElem of char.essences) {
        if (essElem.slot === slot) {
            essenceElementChar = essElem
            if (essenceElementChar.elementType === elementType) {
                return sendErr(socket, "same_element_type", "Тот же тип элемента - запись на сервере не будет обновлена")
            } else {
                break
            }
        }
    }

    if (!essenceElementChar) {//слот пуст
        essenceElementChar = {slot, elementType}
        char.essences.push(essenceElementChar)
    } else {//в слоте что-то есть, надо вернуть юзеру
        const elementTypeOld = essenceElementChar.elementType
        essenceElementChar.elementType = elementType

        const essenceElementUserOld = await user.essences
            .find(elem => {
                return elem.elementType === elementTypeOld
            })
        if (essenceElementUserOld) {
            essenceElementUserOld.amount++
        } else {
            user.essences.push({elementType: elementTypeOld, amount: 1})
        }

    }

    try {
        await user.save()
        await char.save()
    } catch (e) {
        // logicError("essence_from_user_to_char", e.message)
        Error.save(e, command)
        return sendErr(socket, "essence_from_user_to_char", e.message)
    }

    sendSuccess(socket, command, {}, session)
}

function get_data_about_me_and_enemy(myChar, enemyUser, enemyChar, isPlayerBegin) {
    try {
        const turnTime = storage.getBasicSettings("turnTime")


        return {
            isPlayerBegin,
            turnTime: isPlayerBegin ? turnTime : turnTime + storage.getBasicSettings("turnTimeBonusForSecond"),
            // turnTime: isPlayerBegin ? keys.turnTime : keys.turnTimeEnemy,
            waitTime: storage.getBasicSettings('waiting_time_for_click_button_ok'),
            EnemyData: {
                name: enemyUser.nick_name,
                elementType: enemyChar.elementType,
                asset_id: enemyChar.asset_id,
                hp: enemyChar.hp_max || storage.getBasicSettings('start_hp'),
                mana: enemyChar.mana_max || storage.getBasicSettings('start_mana'),
                SpellPreset: get_selected_preset_spells_advance(enemyChar),
                charId: enemyChar._id,
            },
            PlayerData: {
                hp: myChar.hp_max || storage.getBasicSettings('start_hp'),
                mana: myChar.mana_max || storage.getBasicSettings('start_mana'),
                SpellPreset: get_selected_preset_spells_advance(myChar),
                charId: myChar._id
            }
        }
    } catch (e) {
        Error.save(e, {
            loginMy: myChar.userName,
            loginEnemy: enemyUser.login,
        })
        return null
    }
}

function print(obj) {

    try {
        if (storage.testMode()) {
            console.log(JSON.stringify(obj))
        }
    } catch (e) {

    }
}

function get_selected_preset_spells_advance(charObj) {
    try {
        const selected_preset = charObj.selected_preset
        const result = charObj.presets
            .map((preset, index) => {
                preset.Selected = index === selected_preset
                preset.Index = index
                return preset
            })
            .filter(preset => {
                return preset.Selected
            })
            .map((preset, index) => {
                return {
                    Selected: true,
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
        return result[0]
    } catch (e) {
        Error.save(e, {charObj})
        return null
    }
}

//Отзыв заявки на поединок
function cancel_bid(socket, command, session) {

    // const charId = session.current_char_Id
    // if (!charId) return false
    // const char = session.user.getCharById(charId)
    // if (!char) return false

    const char = session.currentCharGet()
    if (!char) return false
    if (session.state === sessionStates.search_for_enemy) {
        // session.current_char_Id = null
        session.currentCharDel()

        session.state = sessionStates.undef
        session.cancel_timer(sessionStates.search_for_enemy)

        storage.cancelBid(session.sessionId, char.level)
        sendSuccess(socket, command, {
            state: session.state,
        }, session)
    }
}

function addGoldAfterVictory(session, char, socket) {

    return true
}

function defeat(session) {
    session.state = sessionStates.defeat
    session.enemySessionId = ''
    // sendErr(socket, 'горечь поражения...')
    sendErr(session.socket, errorIds.your_hp_is_over, 'Вы проиграли!')
}

async function victory(session) {
    session.state = sessionStates.victory
    // const charId = session.current_char_Id
    // if (!charId) return logicError('missing_combat_char_victory', 'session.current_char_Id')

    // const char = session.user.getCharById(charId) // console.log('char',JSON.stringify(char))
    const char = session.currentCharGet()
    if (!char) return logicError("wrong_charId_victory", "Не удалось найти персонаж по charId:" + command.charId)

    const socket = session.socket
    if (!socket) return logicError("missing_socket_victory")


    if (char.folios.length >= 3) {
        sendErr(socket, 'Тут бы вам вручить золота и побольше!', null, session)
        return addGoldAfterVictory(session, char, socket)
    }

    const foliosType = getRandomFoliosType()
    const foliosSettings = storage.getFoliosSettings(foliosType)
    if (!foliosSettings) return logicError('foliosSettings_missing_victory', foliosType)

    char.folios.push({
        state: "None",
        time_length: storage.getBasicSettings('folios_time_length'),
        start_time: 0,//время начала изучения
        asset_id: foliosSettings.AssetID,//asset_id
        foliosType: foliosType,
    })

    try {
        await char.save()
        sendSuccess(socket, {"scr": "victory"}, {
            msg: "new_folio_was_added",
            foliosType,
            state: sessionStates.victory
        }, session)
    } catch (e) {
        // logicError("error_add_folio_victory", "Ошибка при создании фолианта" + e.message)
        Error.save(e, {charId: char._id})
        sendErr(socket, "error_add_folio_victory", "Ошибка при создании фолианта" + e.message, session)
    }
}

//Текстовое сообщение противнику
function text_message(socket, command, session) {

    const msg = command.msg
    if (!msg)
        sendErr(socket, 'msg_missing', 'Отсутствует поле с текстом сообщения msg', session)

    try {
        const enemySession = storage.getSession(session.enemySessionId)
        enemySession.socket.send(msg)
        sendSuccess(socket, null, {
            msg,
        }, session)
    } catch (e) {
        // logicError('text_message', e.message)
        Error.save(e, command)
        sendErr(socket, 'text_message', e.message, session)
    }
}

//Заявка на поединок
function create_bid(socket, command, session) {
    const user = session.user
    const char = user.getCharById(command.charId)
    if (!char)
        return sendErr(socket, "wrong_charId", "Не удалось найти персонаж по charId:" + command.charId)

    if (command.debug) {
        session.history_enable(true)
        session.history_add(command)
    } else {
        session.history_enable(false)
    }

    // session.current_char_Id = command.charId
    char.setStartParameters()
    session.currentCharSet(char)

    session.cancel_all_timers()

    const enemySession = storage.findEnemyOrCreateBid(session, char)

    if (enemySession) { //Бой!
        enemySession.cancel_all_timers()
        session.enemySessionId = enemySession.sessionId
        session.state = sessionStates.start_battle

        enemySession.enemySessionId = session.sessionId
        enemySession.state = sessionStates.start_battle
        const enemy_char_id = enemySession.current_char_Id
        const enemyUser = enemySession.user
        const enemyChar = enemyUser.getCharById(enemy_char_id)
        enemyChar.setStartParameters()
        enemySession.currentCharSet(enemyChar)

        const isPlayerBegin = randomInteger(1, 2) > 1
        session.playerTurn = isPlayerBegin
        enemySession.playerTurn = !isPlayerBegin

        const myData = get_data_about_me_and_enemy(char, enemyUser, enemyChar, isPlayerBegin)
        myData.state = sessionStates.start_battle
        socket.send(JSON.stringify(myData))
        session.set_timer(sessionStates.start_battle)

        myData.scr = 'create_bid_success'
        session.history_add(myData)


        const enemyData = get_data_about_me_and_enemy(enemyChar, user, char, !isPlayerBegin)
        enemyData.state = sessionStates.start_battle
        enemySession.socket.send(JSON.stringify(enemyData))
        enemySession.set_timer(sessionStates.start_battle)

        enemyData.scr = 'create_bid_success'
        enemySession.history_add(enemyData)


    } else {
        //противиника не нашли, создали заявку и ждем, заводим таймер
        session.set_timer(sessionStates.search_for_enemy, {level: char.level})
        session.state = sessionStates.search_for_enemy
        sendSuccess(socket, command, {
            state: session.state,
            PlayerData: {
                hp: char.hp_current,
                mana: char.mana_current,
            },
        }, session)
    }
}

function start_battle(socket, command, session) {

    sendSuccess(socket, command, {}, session)
    const enemySession = storage.getSession(session.enemySessionId)
    if (!enemySession) {
        session.state = sessionStates.start_battle_cancel
        return sendErr(socket, 'enemy_is_gone', 'Противник отсутствует', session)
    }

    if (enemySession.state === sessionStates.start_battle) {

        session.state = sessionStates.start_battle_waiting

    } else if (enemySession.state === sessionStates.start_battle_waiting) {

        session.cancel_timer(sessionStates.start_battle)
        enemySession.cancel_timer(sessionStates.start_battle)

        session.state = sessionStates.start_battle_success
        enemySession.state = sessionStates.start_battle_success

        sendSuccess(socket, command, {
            state: sessionStates.start_battle_success,
            playerTurn: session.playerTurn,
        }, session)
        sendSuccess(enemySession.socket, command, {
            state: sessionStates.start_battle_success,
            playerTurn: enemySession.playerTurn,
        }, session)

        const timerData = {
            turnIndex: 0, //
        }
        if (session.playerTurn) {
            //первый игрок активен, таймер противнику
            enemySession.set_timer(sessionStates.battle_wait, timerData)
        } else if (enemySession.playerTurn) {

            session.set_timer(sessionStates.battle_wait, timerData)
        } else {

            logicError('start_battle', '!enemySession.playerTurn && !session.playerTurn')
        }

    } else {
        // socket.send(JSON.stringify({msg: '3431513543'}))
        sendErr(socket, 'start_battle_unknown_error')
    }
}

function spell_start(socket, command, session) {

    if (!(session.state === sessionStates.battle_active
        || session.state === sessionStates.battle_wait
        || session.state === sessionStates.start_battle_success))
        return sendErr(socket, 'no_active_play', 'Нет активного поединка', session)

    if (!session.playerTurn)
        return sendErr(socket, 'not_your_turn', 'Не ваш тур', session)

    if (session.is_started_spell)
        return sendErr(socket, 'previous_skill_check_is_active', 'Прежний скилл чек еще активен', session)

    const spellId = command.spellId
    if (!spellId && !(spellId === 0))
        return sendErr(socket, 'missing_spellId', 'В запросе отсутствует spellId')

    const user = session.user
    const char = user.getCharById(command.charId)
    if (!char)
        return sendErr(socket, 'wrong_charId', "Не удалось найти персонаж по charId:" + command.charId)

    const spell_available = char.isSpellInSelectedPreset(spellId)
    if (!spell_available)
        return sendErr(socket, 'spell_not_available', 'spellId=' + spellId)

    const enemySession = storage.getSession(session.enemySessionId)
    if (!enemySession || !enemySession.socket)
        return sendErr(socket, 'enemy_is_gone', 'Противник отсутствует', session)
    session.active_spell_new(command)

    //сообщение игроку
    sendSuccess(socket, command, {
        spell_available,
        spellId,
    }, session)
    // сервер должен сообщить клиенту-наблюдателю о том,
    // что противник начал заклинание (должен быть передан идентификатор заклинания)
    sendSuccess(enemySession.socket, {scr: 'enemy_spell_start'}, {
        spellId,
    }, session)

}

function spell_step(socket, command, session) {
    // В момент попадания в скиллчеке, клиент будет отправлять серверу сообщение,
    // содержащее параметр Status, значение которого может быть "fail", "success","super".
    const status = command.status
    if (!(status === hitStatuses.fail || status === hitStatuses.success || status === hitStatuses.super_
    ))
        return sendErr(socket, 'wrong_status', 'status=' + status)

    const enemySession = storage.getSession(session.enemySessionId)
    if (!enemySession || !enemySession.socket)
        return sendErr(socket, 'enemy_is_gone', 'Противник отсутствует', session)


    session.active_spell_skill_check(command, handle_skill_check)

    function handle_skill_check(err, result) {
        if (err) {

            if (err.errorId === errorIds.your_hp_is_over) {
                victory(session)
                // sendErr(socket, errorIds.enemy_hp_is_over, 'Вы победили!')

                // sendErr(enemySession.socket, errorIds.your_hp_is_over, 'Вы проиграли!')
                defeat(enemySession)

            } else if (err.errorId === errorIds.enemy_hp_is_over) {
                // sendErr(socket, errorIds.your_hp_is_over, 'Вы проиграли!')
                // sendErr(enemySession.socket, errorIds.enemy_hp_is_over, 'Вы победили!')
                victory(enemySession)
                defeat(session)
            } else {
                sendErr(socket, err.errorId, err.errorMsg)
            }

            if (err.e) {
                Error.save(err.e, err)
            }
        } else {
            if (result.sendMsg) {
                //сообщение игроку
                sendSuccess(socket, command, result, session)
                // Если все в порядке, сервер должен сообщить клиенту-наблюдателю о том, что было попадание.
                // Сообщение должно содержать параметр Status и параметр Index, показывающие индекс текущего попадания.
                sendSuccess(enemySession.socket, {scr: 'enemy_spell_step'}, {
                    status,
                    index: result.current_hit_index,
                    PlayerData: result.EnemyData,
                }, session)
            }
        }
    }

}

// у одного персонажа может быть одно активное заклинание в один момент.
// Однако в дальнейшем на игроках могут висеть наложенные эффекты
// - например, отравление, которое раз в секунду отнимает N жизней и длится какое-то время.
// Или, например, эффект, который в течение минуты усиливает все атаки на 20%.
// Такие эффекты могут по несколько штук одновременно висеть на игроках.
// Но что качается именно заклинаний - максимум одно за раз
// при этом может быть ситуация, когда оба игрока в одно время колдуют заклинание.
// Каждый по одному. Но таким образом получается, что в бою одновременно работают 2 заклинания.





























