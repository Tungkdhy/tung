const Route = require('express').Router()
const controller = require('../controllers/auth');
const {tryCatch} = require('../middleware/errorHandle')

Route.post('/login/', tryCatch(controller.login))
Route.post('/newToken', tryCatch(controller.getToken)) 

module.exports = Route;