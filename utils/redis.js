// const redisLib = require('redis')
const client = require('redis').createClient(6379,'192.168.110.9')

const {promisify} = require('util');
const getAsync = promisify(client.get).bind(client);
const errorHandler = require('./errorHTTP')

client.on('error', function(err){
    // console.log('Something went wrong ', err)
});

module.exports.init = function(){

}

module.exports.setUserBySessionId = function (sessionId, user) {
    client.set('s_'+sessionId, user.toString())
}

module.exports.getUserBySessionId =  async function (sessionId) {




    const sessionData = await getAsync('s_'+sessionId);
    // client.get('s_'+sessionId, function(err, reply) {
    //     if (err){
    //         errorHandler(null,'','',err)
    //         return 333
    //     } else {
    //         // console.debug('reply',reply)
    //         JSON.stringify(reply)
    //         // JSON.stringify(reply)
    //     }
    // })


    // const sessionData =  client.get('s_'+sessionId)



     console.debug('sessionData=', sessionData.trim())
    if (!sessionData){
        return null
    } else{

        // try {

            let resalt = JSON.parse(sessionData)
            return resalt
        // }catch (e) {
        //     return null
        // }
    }
}

module.exports.deleteSession = function (sessionId) {

}






















