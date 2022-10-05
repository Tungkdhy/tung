const Route = require('express').Router()
const controller = require('../controllers/exam');
const {requireLogin, requireRole}  = require('../middleware/auth');
const { tryCatch } = require('../middleware/errorHandle');

Route.get('/', requireLogin, requireRole('A', 'T'), tryCatch(controller.get));
Route.get('/search', requireLogin, requireRole('A', 'T'), tryCatch(controller.search));
Route.get('/getTrue/:id', requireLogin, requireRole('A', 'T', 'S'), tryCatch(controller.getTrueById));
Route.get('/:id', requireLogin, requireRole('A', 'T', 'S'), tryCatch(controller.getById));
Route.post('/', requireLogin, requireRole('A'), tryCatch(controller.create));
Route.put('/:id', requireLogin, requireRole('A', 'T', 'S'), tryCatch(controller.update));
Route.delete('/:id', requireLogin, requireRole('A'), tryCatch(controller.deleteById));

module.exports = Route;