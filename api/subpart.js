const db = require('../utils/db')
const {Op} = require("sequelize")

const get = async (req, res) => {
    let filter = {}
    const {exam_id, part_id, textSearch} = req.query
    if(exam_id) filter.exam_id = exam_id
    if(part_id) filter.part_id = part_id
    if(textSearch) {
        filter = {[Op.or]: [
            {name : {[Op.substring]: textSearch}},
            {content : {[Op.substring]: textSearch}}
        ]}
    }
    const {count, rows} = await db.subpart.findAndCountAll({
        where: {
            ...filter,
        },
        ...req.pagination,
        include: [
            {model: db.exam, as: 'exam'},
            {model: db.type_subpart, as: 'type_subpart'}
        ]
    });
    res.set('Content-Range', count).send({
        total: count,
        data: rows
    })
}

const getById = async (req, res) => {
    const data = await db.subpart.findOne({
        where:{id: req.params.id}
    })
    if(!data) res.status(401).send('subpart not found!')
    else res.send(data)
}

const create = async (req, res) => {
    const fields = ['file', 'image'];
    let filter = {}
    if(req.body.data.length >=1) {
        const subpart = await db.subpart.bulkCreate(req.body.data, {
            include: [{
                model: db.questions, as: "questions",
                include: [
                    {model: db.answer, as: "answers"}
                ]
            }]
        });
        const subpartIds = subpart.map((sb) => sb.id)
    
        fields.map(field => {
            if(req.body[field].length > 0){
                req.body[field].map(request => {
                    data = request.split('/').slice(1).join('/').split('_');
                    filter[field] = request
                    db.subpart.update({
                        ...filter
                    }, {
                        where: {
                            name: data[0],
                            id: {
                                [Op.in]: subpartIds
                            }
                        }
                    })
                })
            }
        })
        res.send(subpart);
    }
    else {
        const subpart = await db.subpart.create(req.body.data, {
            include: [{
                model: db.questions, as: "questions",
                include: [
                    {model: db.answer, as: "answers"}
                ]
            }]
        })
        const subpartId = subpart.id
        fields.map(field => {
            if(req.body[field].length > 0) {
                data = req.body[field][0].split('/').slice(1).join('/').split('_');
                filter[field] = req.body[field][0]
                db.subpart.update({
                    ...filter
                }, {
                    where: {
                        name: data[0],
                        id: subpartId
                    }
                })
            }
        })
        res.send(subpart);
    }
}

const update = async (req, res) => {
    const data = await db.subpart.findOne({
        where:{id: req.params.id}
    })
    if(!data) res.status(401).send('subpart not found!')
    else {
        await db.subpart.update({...req.body},{
            where:{id: req.params.id}
        })
        res.send("subpart successfully updated!")
    }
}

const deleteById = async (req, res) => {
    const data = await db.subpart.findOne({
        where:{id: req.params.id}
    })
    if(!data) res.status(401).send('question not found!')
    else {
        await db.subpart.destroy({
            where:{id: req.params.id}
        })
        res.send("question successfully deleted!")
    }
}

const search = async (req, res) => {
    const {name} = req.query;
    const {count, rows} = await db.subpart.findAndCountAll({
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