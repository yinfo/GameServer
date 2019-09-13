const express = require('express')
const controller = require('../controllers/admin')
const router = express.Router()

router.get('/info', controller.info)
router.get('/bids', controller.bids)
router.get('/sessions', controller.sessions)
router.post('/cc',   controller.createCharacters)
router.get('/updateRules',   controller.updateRules)
router.post('/getHistory',   controller.getHistory)

module.exports = router

