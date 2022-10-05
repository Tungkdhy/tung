const Route = require('express').Router()
const controller = require('../controllers/users');
const {requireLogin, requireRole}  = require('../middleware/auth');
const { tryCatch } = require('../middleware/errorHandle');

Route.get('/me', requireLogin, tryCatch(controller.getMe));
Route.get('/search', requireLogin, requireRole('A'), tryCatch(controller.search));
Route.get('/:id', requireLogin, requireRole('A'), tryCatch(controller.getById));
Route.get('/',requireLogin, requireRole('A'),  tryCatch(controller.get));
Route.post('/', requireLogin, requireRole('A'), tryCatch(controller.create));
Route.put('/changePassword', requireLogin, tryCatch(controller.changePassword));
Route.put('/:id', requireLogin, requireRole('A'), tryCatch(controller.edit));
Route.delete('/:id', requireLogin, requireRole('A'), tryCatch(controller.deleteById));

module.exports = Route;