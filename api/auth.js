const db = require('../utils/db')
const security = require('../utils/security')

const login = async (req, res) => {
    const {username, password} = req.body
    const user = await db.users.findOne({
        where: {
            username: username,
            password: password
        }
    })

    if(!user) res.status(401).send('Unauthorized');
    else {
        const token = security.generateToken({username: user.dataValues.username, role_id: user.dataValues.role_id, id: user.dataValues.id}, '3000s');
        // const rfToken = security.generateRFToken({username: user.dataValues.username, role_id: user.dataValues.role_id, id: user.dataValues.id}, '12h');
        try {
            // user.update({
            //     rf_token: rfToken
            // })
            res.send({
                mess: 'Thành công !',
                token: token,
                //refresh_token: rfToken,
                user: {
                    username: user.dataValues.username,
                    role_id: user.dataValues.role_id
                }
            })
        } catch (error) {
            console.log(error)
            res.status(400).send('bad request')
        }
    }
}

const getToken = async (req, res) => {
    const data = security.verifyRFToken(req.body.refresh_token)
    const token = security.generateToken(data, '3000s')
    res.send({
        new_token: token
    })
}
module.exports = {
    login,
    getToken
};