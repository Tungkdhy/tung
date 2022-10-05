const usersRoute = require('./users')
const authRoute = require('./auth')
const questionsRoute = require('./questions')
const answerRoute = require('./answer')
const class_eRoute = require('./class_e')
const examRoute = require('./exam')
const subpartRoute = require('./subpart')
const user_examRoute = require('./user_exam')
const partRoute = require('./part')
const class_examRoute = require('./class_exam')
const user_classRoute = require('./user_class')

const route = (app) =>{
    app.use('/api/users', usersRoute)
    app.use('/api/auth', authRoute)
    app.use('/api/questions', questionsRoute)
    app.use('/api/answer', answerRoute)
    app.use('/api/class_e', class_eRoute)
    app.use('/api/exam', examRoute)
    app.use('/api/subpart', subpartRoute)
    app.use('/api/user_exam', user_examRoute)
    app.use('/api/part', partRoute)
    app.use('/api/class_exam', class_examRoute)
    app.use('/api/user_class', user_classRoute)
}

module.exports = route;