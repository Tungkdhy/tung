const db = require('../utils/db')
const {Op} = require("sequelize");

const getMe = async (req, res) => {
    const user = await db.users.findOne(
        {
            where: {...req.user}
        })
    if(!user){
        res.status(401).send('Unauthorized')
    }else{
        res.send({...user.dataValues})
    }
}

const getById = async (req, res) => {
    const user = await db.users.findOne({
        where: {id: req.params.id}
    })
    if(!user) res.status(401).send('user not found!')
    else res.send(user)
}

const get = async (req, res) => {
    const {textSearch} = req.query;
    let filter = {};
    if(textSearch) {
        filter.name = {[Op.substring]: textSearch}
    }
    const {rows, count} = await db.users.findAndCountAll({
        where: {
            ...filter
        },
        ...req.pagination
    })
    res.set('Content-Range', count).send({
        total: count,
        data: rows
    })
}

const create = async (req, res) => {
    const user = await db.users.findOne({
        where: {username: req.body.username}
    })
    if(user) res.status(409).send('User already exists!');
    else {
        const data = await db.users.create(req.body);
        res.send(data);
    }
}

const edit = async (req, res) => {
    const user = await db.users.findOne({
        where: {id: req.params.id}
    });
    if(!user) res.status(401).send('User not found!');
    else{
    await db.users.update(
        {
            ...req.body
        }, 
        {
            where: {id: req.params.id}
        }
    )
    res.send('user successfully updated!')
    }
}

const changePassword = async (req, res) => {
    const isAuth = await db.users.findOne({
        where: {
            username: req.user.username, 
            password: req.body.oldPassword
        }
    });
    if(!isAuth) res.status(401).send('Unauthorized');
    else{
        await db.users.update(
            {
                password: req.body.password
            }, 
            {
                where: {username: req.user.username}
            }
        );
        res.send('change password successfully!');
    }
}

const deleteById = async (req, res) => {
    const user = await db.users.findOne({
        where: {id: req.params.id}
    });
    if(!user) res.status(401).send('User not found!');
    else{
        await db.users.destroy({
            where: {id: req.params.id}
        })
        res.send('user susscessfully deleted');
    }
}

const lock = async (req, res) => {
    const {username} = req.body;

    await db.users.update({
        disable: true
    }, {
        where: {
            username: username
        }
    })
    res.send('Account locked');
}

const search = async (req, res) => {
    const {name} = req.query;
    const {count, rows} = await db.users.findAndCountAll({
        where: {
            name: {[Op.substring]: name}
        },
        ...req.pagination
    });
    res.set('Content-Range', count).send(rows)
}

module.exports = {
    getMe,
    getById,
    get,
    create,
    edit,
    deleteById,
    changePassword,
    lock,
    search
}
