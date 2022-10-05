const Route = require('express').Router();
const controller = require('../controllers/user_class');
const {tryCatch} = require('../middleware/errorHandle');
const {requireLogin, requireRole} = require('../middleware/auth');

Route.get('/', requireLogin, requireRole('A', 'S', 'T'), tryCatch(controller.get));
Route.get('/notClass', requireLogin, requireRole('A', 'T'), tryCatch(controller.getUserNotInClass))
Route.get('/:id', requireLogin, requireRole('A', 'T'), tryCatch(controller.getById));
Route.post('/', requireLogin, requireRole('A'), tryCatch(controller.create));
Route.post('/createUAUC', requireLogin, requireRole('A'), tryCatch(controller.createUsersAndUser_Class));
Route.put('/:class_e_id', requireLogin, requireRole('A'), tryCatch(controller.update));
Route.delete('/:id', requireLogin, requireRole('A'), tryCatch(controller.deleteById));

module.exports = Route;