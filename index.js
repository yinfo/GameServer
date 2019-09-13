const port = process.env.PORT || 5000
const app = require('./app')
app.listen(port, () => console.log(`HTTP server started  on http://localhost:${port}`))

// const appSocket = require('./whiteboard_server')
// const appSocket = require('./ws_server')
const appSocket = require('./socket_server/server')




// const moment = require('moment-timezone')
//
// const t1 = storage.now()
// const ts1 = t1.valueOf()
// console.log('now=',t1.format("DD MMM YYYY hh:mm:ss.SSS"))
// console.log('ts1', ts1 )
//
// const t2 = storage.now()
// const ts2 = t2.valueOf()
// console.log('now=',t2.format("DD MMM YYYY hh:mm:ss.SSS"))
// console.log('ts2', ts2 )
//
// const t3 = storage.now()
// const ts3 = t3.valueOf()
// console.log('now=',t3.format("DD MMM YYYY hh:mm:ss.SSS"))
// console.log('ts3', ts3 )
//
// const t4 = storage.now()
// const ts4 = t4.valueOf()
// console.log('now=',t4.format("DD MMM YYYY hh:mm:ss.SSS"))
// console.log('ts4', ts4 )
//
// const t5 = storage.now()
// const ts5 = t5.valueOf()
// console.log('now=',t5.format("DD MMM YYYY hh:mm:ss.SSS"))
// console.log('ts5', ts5 )
//
//
// const obj = {
//
// }
//
//
// obj[ts1]= [1]
//
// if(obj.hasOwnProperty(ts2)){
//     obj[ts2].push(2)
// }else{
//     obj[ts2]= [2]
// }
//
// if(obj.hasOwnProperty(ts3)){
//     obj[ts3].push(3)
// }else{
//     obj[ts3]= [3]
// }
//
// if(obj.hasOwnProperty(ts4)){
//     obj[ts4].push(4)
// }else{
//     obj[ts4]= [4]
// }
//
// if(obj.hasOwnProperty(ts5)){
//     obj[ts5].push(5)
// }else{
//     obj[ts5]= [5]
// }
//
// console.log('keys=',Object.getOwnPropertyNames(obj).length)
// for (let key of Reflect.ownKeys(obj)){
//     console.log(obj[key],
//         storage.millisecondsToDate(key)
//         // moment.unix(key/1000).format("DD MMM YYYY hh:mm ")
//     )
// }
// //
// console.log(JSON.stringify(obj))
//
// console.log(obj.hasOwnProperty(ts4))
