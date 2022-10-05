const db = require('../utils/db')

const get = async (req, res) => {
    const {subpart_id, listen_file_id, image_id} = req.query
    let filter = {}
    if(subpart_id) filter.subpart_id = subpart_id
    if(listen_file_id) filter.listen_file_id = listen_file_id
    if(image_id) filter.image_id = image_id

    const {count, rows} = await db.questions.findAndCountAll({
        where: {
            ...filter
        },
        ...req.pagination,
        include: [
            {model: db.subpart, as: 'subpart'},
            {model: db.listen_file, as: 'listen_file'},
            {model: db.image, as: 'image'}   
        ]
    });
    res.set('Content-Range', count).send({
        total: count,
        data: rows
    })
}

const getById = async (req, res) => {
    const data = await db.questions.findOne({
        where:{id: req.params.id}
    })
    if(!data) res.status(401).send('question not found!')
    else res.send(data)
}

const create = async (req, res) => {
    const data = await db.questions.bulkCreate(req.body)
    res.send(data)
}

const update = async (req, res) => {
    const data = await db.questions.findOne({
        where:{id: req.params.id}
    })
    if(!data) res.status(401).send('question not found!')
    else {
        await db.questions.update({...req.body},{
            where:{id: req.params.id}
        })
        res.send("question successfully updated!")
    }
}

const deleteById = async (req, res) => {
    const data = await db.questions.findOne({
        where:{id: req.params.id}
    })
    if(!data) res.status(401).send('question not found!')
    else {
        await db.questions.destroy({
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