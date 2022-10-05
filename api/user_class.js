const e = require("express")
const{Op} = require("sequelize")
const db = require('../utils/db')

const get = async (req, res) => {
    let filter = {}
    const {user_id, class_e_id, type, textSearch} = req.query
    if(class_e_id) filter.class_e_id = class_e_id
    if(user_id) filter.user_id = user_id

    if(req.user.role_id === 'S'){
        const {count, rows} = await db.user_class.findAndCountAll({
            where: {
                user_id: req.user.id
            },
            include: [
                { model: db.class_e, as: 'class_e'},
                { model: db.users, as: 'user'}
            ]
        })
        res.set('Content-Range', count).send({
            total: count,
            data: rows
        })
    }
    else {
        if(type === 'class_e'){
            const {count, rows} = await db.user_class.findAndCountAll({
                where: {
                    ...filter
                },
                ...req.pagination,
                include:[
                    { model: db.class_e, as: 'class_e', where: {
                        name: {[Op.substring]: textSearch}
                    }},
                    { model: db.users, as: 'user'}
                ]
            });
            res.set('Content-Range', count).send({
                total: count,
                data: rows
            })
        }
        else if(type === 'users'){
            const {count, rows} = await db.user_class.findAndCountAll({
                where: {
                    ...filter
                },
                ...req.pagination,
                include:[
                    { model: db.class_e, as: 'class_e'},
                    { model: db.users, as: 'user', where: {
                        name: {[Op.substring]: textSearch}
                    }}
                ]
            });
            res.set('Content-Range', count).send({
                total: count,
                data: rows
            })
        }
        else {
            const {count, rows} = await db.user_class.findAndCountAll({
                where: {
                    ...filter
                },
                ...req.pagination,
                include:[
                    { model: db.class_e, as: 'class_e'},
                    { model: db.users, as: 'user'}
                ]
            });
            res.set('Content-Range', count).send({
                total: count,
                data: rows
            })
        }
    }  
}

const getUserNotInClass = async (req, res) => {
    const {class_e_id} = req.query
    let filter = {}
    if (class_e_id) filter.class_e_id = class_e_id
    const user_classes = await db.user_class.findAll({
        where: {
            ...filter
        },
        include:[
            {model: db.users, as: 'user', attributes: ['role_id']}
        ]
    })

    const studentsInClass = await db.user_class.findAll({
        include: {
            model: db.users, as: 'user', where: {
                role_id: 'S'
            }
        }
    })

    const idStudents = studentsInClass.map((student) => student.user_id)
    let userIds = user_classes.map((user_class) => user_class.user_id)
    userIds = userIds.concat(idStudents)
    const userRoles = user_classes.map((user_class) => user_class.user.role_id)
    if(userRoles.includes('T')) {
        const {count, rows} = await db.users.findAndCountAll({
            where: {
                id: {
                    [Op.notIn]: userIds
                }
            },
            include: {
                model: db.role, as: 'role', where: {
                    id: 'S'
                }
            }
        })
        res.set('Content-Range', count).send({
            total: count,
            data: rows
        })
    }
    else{
        const {count, rows} = await db.users.findAndCountAll({
            where: {
                id: {
                    [Op.notIn]: userIds
                }
            },
            include: {
                model: db.role, as: 'role', where: {
                    [Op.or]: [{ id: 'S' }, { id: 'T' }]
                }
            }
        })
        res.set('Content-Range', count).send({
            total: count,
            data: rows
        })
    }
}

const getById = async (req, res) => {
    const data = await db.user_class.findOne({
        where: {id: req.params.id},
        include: [
            {model: db.users, as: 'user'},
            {model: db.class_e, as: 'class_e'}
        ]
    })
    if(!data) res.status(404).send("user_class not found!")
    else res.send(data)
}

const create = async (req, res) => {
    const data = await db.user_class.bulkCreate(req.body)
    res.send(data)
}

//create users and user_class
const createUsersAndUser_Class = async (req, res) => {
    const class_e = await db.class_e.create({
        ...req.body
    });
    if(typeof(req.body.users) === 'object') {
        const class_users = req.body.users.map(user=> {
            const class_user = {
                'class_e_id': class_e.id,
                'user_id': user
            }
            return class_user
        });
        db.user_class.bulkCreate(class_users)
    }
    else{
        db.user_class.create({
            user_id: req.body.users,
            class_e_id: class_e.id
        })
    }
    res.send(class_e)
}

const update = async (req, res) => {
    const class_e = await db.class_e.findOne({
        where:{id: req.params.class_e_id}
    });
    if(!class_e) res.status(404).send('class_e not found!');
    else {
        await db.user_class.destroy({
            where: {class_e_id: req.params.class_e_id}
        });
        await db.user_class.bulkCreate(req.body);
        res.send("user_class successfully updated!");
    }
}

const deleteById = async (req, res) => {
    const data = await db.user_class.findOne({
        where: {id: req.params.id}
    })
    if(!data) res.status(404).send("user_class not found!")
    else{
        await db.user_class.destroy({
            where: {id: req.params.id}
        })
        res.send("user_class successfully deleted!")
    }
}

module.exports = {
    get,
    getUserNotInClass,
    getById,
    create,
    createUsersAndUser_Class,
    update,
    deleteById
}