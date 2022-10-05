const Route = require('express').Router();
const controller = require('../controllers/class_exam');
const {tryCatch} = require('../middleware/errorHandle');
const {requireLogin, requireRole} = require('../middleware/auth');

Route.get('/', requireLogin, requireRole('A', 'S', 'T'), tryCatch(controller.get));
Route.get('/notClass', requireLogin, requireRole('A', 'T'), tryCatch(controller.getExamNotInClass));
Route.get('/:id', requireLogin, requireRole('A', 'T'), tryCatch(controller.getById));
Route.post('/', requireLogin, requireRole('A'), tryCatch(controller.create));
Route.put('/:class_e_id', requireLogin, requireRole('A'), tryCatch(controller.update));
Route.delete('/:id', requireLogin, requireRole('A'), tryCatch(controller.deleteById));

module.exports = Route;