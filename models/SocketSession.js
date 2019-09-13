// const uniqid = require('uniqid')
// const moment = require('moment')
// const keys = require('../config/keys')

// const sessionStates = require('../config/enums').sessionStates
// const hitStatuses = require('../config/enums').hitStatuses
const MODEL_PATH = '../models/'
const TimeLine = require(MODEL_PATH + 'TimeLine')
const {sessionStates, hitStatuses, buffTypes, spellTargets, spellParamTypes, errorIds} = require('./enums')

module.exports = class SocketSession {

    constructor(socket, sessionId, user) {
        this.tl = new TimeLine()
        this.sessionId = sessionId
        socket.sessionId = sessionId
        this.socket = socket
        this.user = user
        this.current_char_Id = null
        this.current_char = null
        this.last_time = storage.now()
        this.login = user.login
        this.state = sessionStates.undef
        this.enemySessionId = ''
        this.timers = {}
        this.playerTurn = false
        //блок активное заклинание
        this.is_started_spell = false//участник боя начал заклинание с конкретным идентификатором
        this.current_hit_index = 0 //индекс текущего попадания
        this.current_spell_id = -1//идентификатор заклинания
        this.current_spell_status = hitStatuses.undef//последнй статус заклинания
        //конец блока активное заклинание
        //блок history
        this.history = []
        this.historyEnable = false
        //конец history
    }

    currentCharGet() {
        return this.current_char
    }

    currentCharSet(char) {
        this.current_char = char
        this.current_char_Id = char._id
        this.tl.addChar(char)
    }

    currentCharDel() {
        this.current_char = null
        this.current_char_Id = null
    }

    set_timer(timerType, data = null) {
        switch (timerType) {

            case sessionStates.search_for_enemy :

                this.state = sessionStates.search_for_enemy

                //***** TIMER *****
                this.timers[timerType] = setTimeout((_data, _sessionId, _socket) => {
                    if (this.state === sessionStates.search_for_enemy) {
                        storage.cancelBid(_sessionId, _data.level)
                        this.state = sessionStates.fight_with_robot
                        this.send_err('fight_with_robot', 'Не удалось найти противника, бой с ботом', 'create_bid')
                    }
                }, storage.getBasicSettings('waiting_time_for_duel') * 1000, data, this.sessionId, this.socket)

                break
            case sessionStates.start_battle:

                this.state = sessionStates.start_battle

                //***** TIMER *****
                this.timers[timerType] = setTimeout((_socket) => {
                    if (this.state === sessionStates.start_battle ||
                        this.state === sessionStates.start_battle_waiting) {
                        this.state = sessionStates.start_battle_cancel
                        this.send_err('start_battle_cancel', 'Бой не состоялся', 'start_battle')
                    }
                }, storage.getBasicSettings('waiting_time_for_click_button_ok') * 1000, this.socket)

                break
            case sessionStates.battle_wait:
                let turnIndex = data.turnIndex
                const turnTime = storage.getBasicSettings("turnTime")
                const turnTimeBonusForSecond = storage.getBasicSettings("turnTimeBonusForSecond")
                const waiting_time = turnIndex === 1 ? turnTime + turnTimeBonusForSecond : turnTime

                //***** TIMER *****
                this.timers[timerType] = setTimeout((_data) => {
                    this.state = sessionStates.battle_active
                    const enemySession = storage.getSession(this.enemySessionId)

                    if (enemySession) {
                        enemySession.state = sessionStates.battle_wait

                        turnIndex = turnIndex + 1
                        _data.turnIndex = turnIndex
                        const waiting_time_for_next = turnIndex === 1 ? turnTime + turnTimeBonusForSecond : turnTime

                        const resData = {
                            scr: 'next_turn',
                            turnIndex,
                            timer: waiting_time_for_next,
                        }


                        const myChar = this.currentCharGet()

                        const enemyChar = enemySession.currentCharGet()
                        if (!enemyChar) return {
                            errorId: 'enemySession.currentCharGet() === null'
                        }

                        this.playerTurn = true
                        resData.playerTurn = true
                        resData.state = sessionStates.battle_active
                        resData.PlayerData = {
                            hp: myChar.hp_current,
                            mana: myChar.mana_current
                        }
                        resData.EnemyData = {
                            hp: enemyChar.hp_current,
                            mana: enemyChar.mana_current
                        }

                        try {
                            this.socket.send(JSON.stringify(resData))
                        } catch (e) {
                            console.error('4444444')
                        }

                        enemySession.playerTurn = false
                        resData.playerTurn = false
                        resData.state = sessionStates.battle_wait
                        resData.PlayerData = {
                            hp: enemyChar.hp_current,
                            mana: enemyChar.mana_current
                        }
                        resData.EnemyData = {
                            hp: myChar.hp_current,
                            mana: myChar.mana_current
                        }

                        try {
                            enemySession.socket.send(JSON.stringify(resData))
                        } catch (e) {
                            console.error('5555555')
                        }

                        enemySession.set_timer(sessionStates.battle_wait, data)
                    } else {
                        // try {
                        //     this.socket.send(JSON.stringify({
                        //         msg: 'enemy_is_gone'
                        //     }))
                        // }catch (e) {
                        //     console.error('enemy_is_gone SocketSession')
                        // }
                    }

                }, waiting_time * 1000, data)

                break
        }
    }

    send_err(errorId, msg = null, scr = '') {
        msg = msg ? msg : errorId
        const uid = this.socket.__uid

        try {
            const resObj = {
                uid,
                errorId,
                msg,
                state: this.state,
            }
            if (scr) {
                resObj.scr = scr
            }

            this.socket.send(JSON.stringify(resObj))
        } catch (e) {
            console.debug('send_err', e.message)
        }
        return false
    }

    history_enable(value) {
        this.historyEnable = value
    }

    history_add(payload) {
        if (this.historyEnable) {
            this.history.push({
                scr: payload.scr,
                date: storage.now(),
                payload,
            })
        }
    }

    history_clear() {
        this.history = []
    }

    history_get() {
        return this.history
    }

    history_save() {

    }

    cancel_timer(timerType) {
        if (this.timers[timerType]) {
            clearTimeout(this.timers[timerType])
        }
    }

    cancel_all_timers() {
        this.cancel_timer(sessionStates.search_for_enemy)
        this.cancel_timer(sessionStates.start_battle)
        this.cancel_timer(sessionStates.battle_wait)
        this.cancel_timer(sessionStates.battle_active)
    }

    active_spell_new(command) {
        this.is_started_spell = true
        this.current_hit_index = 0
        this.current_spell_id = command.spellId
        this.current_spell_status = hitStatuses.undef
    }

    active_spell_skill_check(command, callback) {
        // Сервер должен проверить, является ли этот игрок начавшим заклинание.

        // if (!this.is_started_spell) return {
        //     errorId: 'player_is_not_started_spell',
        //     errorMsg: 'Игрок не является начавшим заклинание',
        // }
        if (!this.is_started_spell) {
            callback({
                errorId: 'player_is_not_started_spell',
                errorMsg: 'Игрок не является начавшим заклинание',
            })
            return false
        }


        // Если все в порядке, то сервер должен увеличить индекс текущего попадания для ходящего игрока.
        // Сервер должен проверять, не вылезает ли увеличенный индекс
        //    за пределы количества элементов массива параметров заклинания.

        let currentSpellParam
        let this_is_the_last_hit = false
        let _current_hit_index

        const spellObj = storage.getSpellById(this.current_spell_id)
        if (!spellObj)
            callback( {
                errorId: 'WRONG_SPELL_ID',
                errorMsg: 'неверный spellId=' + this.current_spell_id,
            })

        const spellParams = spellObj.spellParams
        if (!spellParams){
            callback( {
                errorId: 'WRONG_spellParams',
                errorMsg: 'неверный spellParams у заклинания spellId=' + this.current_spell_id,
            })
            return false
        }

        if (command.status === hitStatuses.fail) {
            this_is_the_last_hit = true
            this.is_started_spell = false
            if (this.current_hit_index === 0) {
                currentSpellParam = spellParams[0]
            } else {
                currentSpellParam = spellParams[this.current_hit_index]
            }

        } else {
            try {
                this.current_hit_index++
                _current_hit_index = this.current_hit_index
                if (this.current_hit_index > spellParams.length - 1) {
                    this.is_started_spell = false
                    callback( {
                        errorId: 'index_goes_beyond_number_of_spell_params',
                        errorMsg: 'индекс выходит за пределы количества элементов массива параметров заклинания',
                    })
                    return false
                } else if (this.current_hit_index === (spellParams.length - 1)) {
                    this_is_the_last_hit = true
                    currentSpellParam = spellParams[this.current_hit_index]
                }

            } catch (e) {
                this.is_started_spell = false
                this.current_hit_index = -1
                callback( {
                    e,
                    errorId: 'incorrect_spellId_or_missing_spell_params',
                    errorMsg: 'spellId=' + command.spellId + ', ' + e.message,
                })
                return false
            }
        }

        if (this_is_the_last_hit) {
            callback(null, {
                sendMsg: true,
                current_hit_index: this.current_hit_index,
                is_last_hit: this_is_the_last_hit,
                status: command.status,
            })
            this.cast_spell(this.current_spell_id, currentSpellParam, cast_spell_handler)
        } else {
            callback(null, {
                sendMsg: true,
                current_hit_index: this.current_hit_index,
                is_last_hit: this_is_the_last_hit,
                status: command.status,
            })
            return true
        }


        function cast_spell_handler( err, castSpellResult) {

            if(err){
                callback(err)
                return false
            }else {
                callback(null, {
                    sendMsg: castSpellResult.sendMsg,
                    current_hit_index: _current_hit_index,
                    is_last_hit: this_is_the_last_hit,
                    status: command.status,
                    currentSpellParam,
                    PlayerData: castSpellResult.PlayerData,
                    EnemyData: castSpellResult.EnemyData,
                })
                return true
            }
        }
    }

    cast_spell(spellId, spellParam, callback) {

        this.is_started_spell = false
        const result = {sendMsg: true}
        const PlayerData = {}
        const EnemyData = {}

        try {
            const spellObj = storage.getSpellById(spellId)
            if (!spellObj) {
                result.errorId = 'WRONG_SPELL_ID'
                callback(result)
                return false
            }
            const damage = Math.round(spellObj.value * spellParam)
            const myChar = this.current_char

            //контроль маны
            if ((myChar.mana_current - spellObj.mana_cost) < 0) {
                result.errorId = 'mana_is_over'
                result.errorMsg = 'mana_current=' + myChar.mana_current + ', mana_cost=' + spellObj.mana_cost
                callback(result)
                return false
            }

            const life_time = spellObj.life_time
            if (life_time > 0) {
                result.sendMsg = true

                const payload = getPayload(spellObj, damage)
                if (payload.type === buffTypes.undef) {
                    result.errorId = 'WRONG_SPELL_NAME'
                    result.errorMsg = 'NAME=' + spellObj.name
                    callback(result)
                    return false
                }
                let hpErr = myChar.setHpMana(null, myChar.mana_current - spellObj.mana_cost)
                if(hpErr){
                    callback(hpErr)
                    return false
                }

                this.tl.addEvents(payload, life_time, (err, payloads) => {
                    const myChar = this.current_char
                    if (err) {
                        console.error(JSON.stringify(err))
                        callback(err)
                        return false
                    } else {
                        for (let payload of payloads) {
                            // console.log(JSON.stringify(payload))
                            switch (payload.type) {//другие три типа todo
                                case buffTypes.hp_plus_self:
                                    let hpErr =  myChar.setHpMana(myChar.hp_current + payload.value)
                                    console.log('payload.value', payload.value)
                                    if(hpErr) {
                                        callback(hpErr)
                                        // this.send_err(errorIds.your_hp_is_over)
                                    }

                                    break
                            }
                        }
                    }
                })

                return true
            } else {

                PlayerData.hp = myChar.hp_current
                PlayerData.mana = myChar.mana_current - spellObj.mana_cost
                PlayerData.damage = damage
                let myCharHpErr = myChar.setHpMana(null, PlayerData.mana)
                if (myCharHpErr){
                    callback(myCharHpErr)
                    return false
                }

                const enemySession = storage.getSession(this.enemySessionId)
                const enemyChar = enemySession.currentCharGet()

                EnemyData.hp = enemyChar.hp_current + damage
                EnemyData.mana = enemyChar.mana_current
                EnemyData.damage = damage

                let enemyHpErr = enemyChar.setHpMana(EnemyData.hp, null)
                if(enemyHpErr){
                    // enemySession.send_err(errorIds.your_hp_is_over)
                    callback(enemyHpErr)
                    return false
                }

                result.PlayerData = PlayerData
                result.EnemyData = EnemyData


                callback( null, result)
                return true
            }
        } catch (e) {
            result.e = e
            result.errorId = 'cast_spell'
            result.errorMsg = e.message
            callback(result)
            return false
        }
        function getPayload(spellObj, damage) {
            let payload = {type: buffTypes.undef}

            if (spellObj.param_type === spellParamTypes.currentHealth) {
                if (spellObj.target === spellTargets.self) {
                    payload.type = buffTypes.hp_plus_self
                    payload.value = damage
                } else {
                    payload.type = buffTypes.hp_minus_enemy
                    payload.value = damage
                }
            } else if (spellObj.param_type === spellParamTypes.currentMana) {
                if (spellObj.target === spellTargets.self) {
                    payload.type = buffTypes.mana_plus_self
                    payload.value = damage
                } else {
                    payload.type = buffTypes.mana_minus_enemy
                    payload.value = damage
                }
            } else {
                payload.type = buffTypes.undef
                payload.value = 0
            }

            return payload
        }
    }
}


