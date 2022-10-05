const db = require('../utils/db')

const get = async (req, res) => {
    const {count, rows} = await db.part.findAndCountAll({
        ...req.pagination,
        include:{model: db.type_subpart, as: 'type_subparts', attributes: ['id', 'type']},
        order: [['name', 'ASC']]
    });
    res.set('Content-Range', count).send({
        total: count,
        data: rows
    })
}

const getById = async (req, res) => {
    const data = await db.part.findOne({
        where:{id: req.params.id}
    })
    if(!data) res.status(401).send('part not found!')
    else res.send(data)
}

module.exports = {
    get,
    getById
}