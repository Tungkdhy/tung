const { response } = require('express')
const db = require('../utils/db')

const get = async (req, res) => {
    const {question_id} = req.query
    let filter = {}
    if(question_id) filter.question_id = question_id

    const {count, rows} = await db.answer.findAndCountAll({
        where: {
            ...filter
        },
        ...req.pagination,
        include: [
            {model: db.questions, as: 'questions'}
        ]
    });
    res.set('Content-Range', count).send({
        total: count,
        data: rows
    })
}

const getById = async (req, res) => {
    const data = await db.answer.findOne({
        where:{id: req.params.id}
    })
    if(!data) res.status(401).send('answer not found!')
    else res.send(data)
}

const create = async (req, res) => {
    const data = await db.answer.bulkCreate(req.body)
    res.send(data)
}

const update = async (req, res) => {
    const data = await db.answer.findOne({
        where:{id: req.params.id}
    })
    if(!data) res.status(401).send('answer not found!')
    else {
        await db.answer.update({...req.body},{
            where:{id: req.params.id}
        })
        res.send("answer successfully updated!")
    }
}

const deleteById = async (req, res) => {
    const data = await db.answer.findOne({
        where:{id: req.params.id}
    })
    if(!data) res.status(401).send('question not found!')
    else {
        await db.answer.destroy({
            where:{id: req.params.id}
        })
        res.send("question successfully deleted!")
    }
}

module.exports = {
    get,
    getById,
    create,
    update,
    deleteById,
}