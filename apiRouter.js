// Imports
let express = require('express')
let usersCtrl = require('./routes/usersCtrl')
let notesCtrl = require('./routes/notesCtrl')

//Router
exports.router = (function () {
    let apiRouter = express.Router()

    // Users routes
    apiRouter.route('/users/register').post(usersCtrl.register)
    apiRouter.route('/users/login').post(usersCtrl.login)
    apiRouter.route('/users/me').get(usersCtrl.getUserProfile)
    apiRouter.route('/users/me').put(usersCtrl.updateUserProfile)

    // Messages
    apiRouter.route('/messages/new').post(notesCtrl.createMessage)
    apiRouter.route('/messages').get(notesCtrl.listMessages)

    return apiRouter
})();