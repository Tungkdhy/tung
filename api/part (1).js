const Route = require('express').Router()
const controller = require('../controllers/part');
const {requireLogin, requireRole}  = require('../middleware/auth');
const { tryCatch } = require('../middleware/errorHandle');

Route.get('/', requireLogin, requireRole('A'), tryCatch(controller.get));
Route.get('/:id', requireLogin, requireRole('A'), tryCatch(controller.getById));

module.exports = Route;