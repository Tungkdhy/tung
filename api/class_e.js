const db = require('../utils/db')
const {Op} = require("sequelize")

const get = async (req, res) => {
    const {textSearch} = req.query;
    let filter = {};
    if(textSearch) {
        filter.name = {[Op.substring]: textSearch}
    }
    const {count, rows} = await db.class_e.findAndCountAll({
        where: {
            ...filter
        },
        ...req.pagination,
    });
    res.set('Content-Range', count).send({
        total: count,
        data: rows
    })
}

const getById = async (req, res) => {
    const data = await db.class_e.findOne({
        where:{id: req.params.id}
    })
    if(!data) res.status(401).send('class_e not found!')
    else res.send(data)
}

const create = async (req, res) => {
    const data = await db.class_e.create(req.body)
    res.send(data)
}

const update = async (req, res) => {
    const data = await db.class_e.findOne({
        where:{id: req.params.id}
    })
    if(!data) res.status(401).send('class_e not found!')
    else {
        await db.class_e.update({...req.body},{
            where:{id: req.params.id}
        })
        res.send("class_e successfully updated!")
    }
}

const deleteById = async (req, res) => {
    const data = await db.class_e.findOne({
        where:{id: req.params.id}
    })
    if(!data) res.status(401).send('class_e not found!')
    else {
        await db.class_e.destroy({
            where:{id: req.params.id}
        })
        res.send("class_e successfully deleted!")
    }
}

const search = async (req, res) => {
    const {name} = req.query;
    const {count, rows} = await db.class_e.findAndCountAll({
        where: {
            name: {[Op.substring]: name}
        },
        ...req.pagination
    });
    res.set('Content-Range', count).send(rows)
}

module.exports = {
    get,
    getById,
    create,
    update,
    deleteById,
    search
}