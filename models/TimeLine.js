// const uniqid = require('uniqid')
// const keys = require('../config/keys')
// const {sessionStates, hitStatuses} = require('../config/enums')
// const moment = require('moment-timezone')

// const mom1 =moment({years: '2015', months: '2',date: '5', hours: '15', minutes: '10', seconds: '3'})

module.exports = class TimeLine {

    constructor() {
        this.char = null
        this.dateArr = []
        this.payloads = {}
        this.checkDateArrInterval = 2
        this.checkDateArrCallback = null
    }

    addChar(char){
        this.char = char
        this.checkDateArr()
    }

    checkDateArr( checkInterval = this.checkDateArrInterval) {
        //***** TIMER *****
        setTimeout(() => {

            if(this.char)
                this.char.regenerateManaTick()

            if(this.dateArr.length > 0){
                let nowMoment = storage.now()
                console.log('nowMoment', nowMoment)

                const goodArr = []

                for (let timeMoment of this.dateArr) {
                    if (timeMoment <= nowMoment) {//момент в прошлом или настоящем
                        goodArr.push(timeMoment)
                    } else {
                        break
                    }
                }

                if (goodArr.length > 0) {

                    this.dateArr = this.dateArr
                        .filter(timeMoment => {
                            return timeMoment > nowMoment
                        })

                    for (let curMoment of goodArr) {
                        let payload = this.payloads[curMoment]
                        delete this.payloads[curMoment]

                        if (payload) {
                            this.checkDateArrCallback(null, payload)
                        } else {
                            console.error('578698738793')
                        }
                    }
                }
            }
            // if(this.dateArr.length > 0){
            //     this.checkDateArr(callback)
            // }
            this.checkDateArr()

        }, checkInterval * 1000)
    }

    addEvents(payload, life_time, callback) {

        this.checkDateArrCallback = callback

        const regeneration_time_factor = storage.getBasicSettings('regeneration_time_factor')
        for (let i = 1; i < life_time + 1; i++) {
            let timeMoment = storage.now().add(regeneration_time_factor * i, 'seconds')
            binaryInsert(timeMoment, this.dateArr)

            if (this.payloads[timeMoment]) {
                this.payloads[timeMoment].push(payload)
            } else {
                this.payloads[timeMoment] = [payload]
            }
        }
    }
}

function binaryInsert(value, array, startVal, endVal) {

    let length = array.length;
    let start = typeof (startVal) != 'undefined' ? startVal : 0;
    let end = typeof (endVal) != 'undefined' ? endVal : length - 1;//!! endVal could be 0 don't use || syntax
    let m = start + Math.floor((end - start) / 2);

    if (length == 0) {
        array.push(value);
        return;
    }

    if (value > array[end]) {
        array.splice(end + 1, 0, value);
        return;
    }

    if (value < array[start]) {//!!
        array.splice(start, 0, value);
        return;
    }

    if (start >= end) {
        return;
    }

    if (value < array[m]) {
        binaryInsert(value, array, start, m - 1);
        return;
    }

    if (value > array[m]) {
        binaryInsert(value, array, m + 1, end);
        return;
    }

    //we don't insert duplicates [ // мы не вставляем дубликаты]
}


