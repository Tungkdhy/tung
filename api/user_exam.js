const { response } = require('express')
const db = require('../utils/db')

const get = async (req, res) => {
    let filter = {}
    const {user_id, exam_id} = req.query
    if(exam_id) filter.exam_id = exam_id
    if(user_id) filter.user_id = user_id

    const {count, rows} = await db.user_exam.findAndCountAll({
        where: {
            ...filter
        },
        ...req.pagination,
        include:[
            { model: db.exam, as: 'exam'},
            { model: db.users, as: 'user'}
        ] 
    });
    res.set('Content-Range', count).send({
        total: count,
        data: rows
    })
}

const getById = async (req, res) => {
    const data = await db.user_exam.findOne({
        where: {id: req.params.id},
        include: [
            {model: db.users, as: 'user'},
            {model: db.exam, as: 'exam'}
        ]
    })
    if(!data) res.status(404).send("user_exam not found!")
    else res.send(data)
}

const create = async (req, res) => {
    const {count, rows} = await db.user_exam.findAndCountAll({
        where: {
            user_id: req.user.id,
            exam_id: req.body.exam_id
        }
    })
    if(count === 1){
        if(rows[0].dataValues.times_left >0){
            const times_left = rows[0].dataValues.times_left -1
            const user_exam = await db.user_exam.create({
                ...req.body,
                user_id: req.user.id,
                times_left: times_left
            })
            res.send(user_exam)
        }
        else res.status(413).send("Payload Too Large")
    }
    else if(count > 1){
        console.log(count)
        const u_s = rows.reduce((a, b)=> {
            return (a.dataValues.date_exam > b.dataValues.date_exam) ? a: b
        })
        console.log(u_s)
        if(u_s.dataValues.times_left > 0){
            const times_left = u_s.dataValues.times_left -1
            const user_exam = await db.user_exam.create({
                ...req.body,
                user_id: req.user.id,
                times_left: times_left
            })
            res.send(user_exam)
        }
        else res.status(413).send("Payload Too Large")
    }
    else {
        const user_exam = await db.user_exam.create({
            ...req.body,
            user_id: req.user.id,
            times_left: 0
        })
        res.send(user_exam)
    }
}

const update = async (req, res) => {
    const data = await db.user_exam.findOne({
        where:{id: req.params.id}
    });

    if(!data) res.status(404).send('user_exam not found!');
    else {
        await db.user_exam.update({...req.body},{
            where:{id: req.params.id}
        })
        res.send("user_exam successfully updated!")
    }
}

const deleteById = async (req, res) => {
    const data = await db.user_exam.findOne({
        where: {id: req.params.id}
    })
    if(!data) res.status(404).send("user_exam not found!")
    else{
        await db.user_exam.destroy({
            where: {id: req.params.id}
        })
        res.send("user_exam successfully deleted!")
    }
}

module.exports = {
    get,
    getById,
    create,
    update,
    deleteById
}