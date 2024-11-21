const express  = require('express')
const MagnetController  = require('../controllers/magnetController');

const MagnetRouter = express.Router()

MagnetRouter.get('/api', (request, response)=>{
    const magnetController = new MagnetController(response)
    magnetController.search(request)
})

module.exports = MagnetRouter