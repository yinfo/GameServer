const MODEL_PATH = '../models/'
const Error = require(MODEL_PATH + 'Error')
const shared = require('./shared')
const Character = require(MODEL_PATH + 'Character')

module.exports.bids = async function (req, res) {

    const bids = storage.getBids()

    res.status(200).json([...bids])
}

module.exports.getHistory = async function (req, res) {

    const sessionId = req.body.sessionId
    if (!sessionId) {
        res.status(200).json({
            type: 'error',
            errorId: 'NO_SESSION_ID_SENT',
            message: 'В запросе не указан sessionId'
        })
        return false
    }

    const session = storage.getSession(sessionId)
    const history =  session.history_get()
    res.status(200).json(history)
}

module.exports.sessions = async function (req, res) {

    const sessions = storage.getSessions()
    const result = Object.keys(sessions)
        .map((key, index) => {
            const session = sessions[key]
            return {
                key,
                state: session.state,
                last_time: session.last_time,
            }
        })
    res.status(200).json(result)
}

module.exports.info = async function (req, res) {


    const docs = await  Character.find({hp_default:undefined})
    docs.forEach((doc) =>{
        doc.hp_max = undefined
        doc.hp_default = storage.getBasicSettings("start_hp")
        doc.hp_max = undefined
        doc.mana_default = storage.getBasicSettings("start_mana")
        try {
            doc.save()
        }catch (e) {
            console.log(e.message)
        }
    })

    res.status(200).json({
        msg: docs.length
    })
    // const myMap = new Map()
    // myMap.set(1,[1,2,3])
    // myMap.set(2, '2')
    //
    // let arr = myMap.get(1)
    //
    // arr.splice(1,1)
    //
    // res.status(200).json([...myMap])


    //
    // try {
    //
    //     let os = require('os')
    //     console.log(os.hostname())
    //     res.status(404).json({
    //         message: 'hostname='+os.hostname()
    //     })
    // }catch (e) {
    //     res.status(404).json({
    //         message: 'hostname='+e.message
    //     })
    // }


    // let ifaces = os.networkInterfaces();
    //
    // Object.keys(ifaces).forEach(function (ifname) {
    //     let alias = 0;
    //
    //     ifaces[ifname].forEach(function (iface) {
    //         if ('IPv4' !== iface.family || iface.internal !== false) {
    //             // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
    //             return;
    //         }
    //
    //         if (alias >= 1) {
    //             // this single interface has multiple ipv4 addresses
    //             console.log(ifname + ':' + alias, iface.address);
    //         } else {
    //             // this interface has only one ipv4 adress
    //             console.log(ifname, iface.address);
    //         }
    //         ++alias;
    //     });
    // });

}

module.exports.createCharacters = async function (req, res) {
    const user = await shared.checkSession(req, res, false)
    if (!user) {
        return false
    }

    if (user.characters.length === 0) {

        const result = await shared.createUserCharacters(req, res, user)
        if (result) {
            res.status(201).json({"message": "Персонажи созданы"})
        } else {

        }

    } else {
        res.status(201).json({"message": "Коллекция персонажей не пуста"})
    }
}

module.exports.updateRules = function (req, res) {

    try {
        storage.updateRules()
        res.status(201).json({
            updateRules:true,
            serverTime:storage.now()
        })
    }catch (e) {
        res.status(201).json({
            error:e.message,
        })
    }

    // res.status(201).json(storage.getSpellById(0))
    // res.status(201).json(storage.getSpellsByElement("plasma"))

}
