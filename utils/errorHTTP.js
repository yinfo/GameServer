const MODEL_PATH = '../models/'
const Error = require(MODEL_PATH + 'Error')


const winston = require('winston')
// const fs = require('fs');
const {createLogger, format, transports} = winston;

const logger = createLogger({
    format: format.combine(
        format.timestamp(),
        format.simple()
    ),
    transports: [
        new transports.Console({
            format: format.combine(
                format.timestamp(),
                format.colorize(),
                format.simple()
            ),
            level: 'error'
        })

        // new transports.File({
        //     filename: './public/log.json',
        //     maxsize: 8024,
        //     level: 'error'
        // })
    ]
})


module.exports = function errorHandler(
    res = null,
    errorId = 'UNKNOWN ERROR',
    message = null,
    err = null) {
    let level = 'info'
    switch (errorId) {
        case 'UNKNOWN ERROR':
            message = 'Неизвестная ошибка - ' + (err ? err.message : '')
            level = 'error'
            break
        case 'DATA_BASE_WRITE_ERROR':
            message = 'Ошибка при записи пользователя в БД - ' && err.message
            level = 'error'
            break
        case 'LOGIN_ALREADY_EXISTS':
            level = 'info'
            break
        case 'WRONG_PASSWORD':
            message = 'Неправильный пароль'
            level = 'info'
            break
        // default:
        //     message = 'Непонятная ошибка'
        //     level = 'error'
    }

    // if (level) {
    //     logger.log({
    //         level: level,
    //         message: JSON.stringify({errorId, message})
    //     })
    // }


    if (res){
        res.status(200).json({
            type: 'error',
            errorId,
            message
        })
    }

}
