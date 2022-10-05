const Route = require('express').Router()
const controller = require('../controllers/subpart');
const {requireLogin, requireRole}  = require('../middleware/auth');
const { tryCatch } = require('../middleware/errorHandle');
const {multipleUploads, checkMultipleFile} = require('../middleware/file')

Route.get('/', requireLogin, requireRole('A'), tryCatch(controller.get));
Route.get('/search', requireLogin, requireRole('A'), tryCatch(controller.search));
Route.get('/:id', requireLogin, requireRole('A'), tryCatch(controller.getById));
Route.post('/', requireLogin, requireRole('A'), multipleUploads, checkMultipleFile, tryCatch(controller.create));
Route.put('/:id', requireLogin, requireRole('A'), tryCatch(controller.update));
Route.delete('/:id', requireLogin, requireRole('A'), tryCatch(controller.deleteById));

module.exports = Route;