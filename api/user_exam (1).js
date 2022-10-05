const Route = require('express').Router()
const controller = require('../controllers/user_exam');
const {requireLogin, requireRole}  = require('../middleware/auth');
const { tryCatch } = require('../middleware/errorHandle');

Route.get('/', requireLogin, requireRole('A', 'T'), tryCatch(controller.get));
Route.get('/:id', requireLogin, requireRole('A', 'T'), tryCatch(controller.getById));
Route.post('/', requireLogin, requireRole('A', 'S'), tryCatch(controller.create));
Route.put('/:id', requireLogin, requireRole('A', 'T'), tryCatch(controller.update));
Route.delete('/:id', requireLogin, requireRole('A'), tryCatch(controller.deleteById));

module.exports = Route;