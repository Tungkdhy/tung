const db = require('../utils/db')
const{Op} = require("sequelize")

const get = async (req, res) => {
    let filter = {}
    const {exam_id, class_e_id, type, textSearch} = req.query
    if(class_e_id) filter.class_e_id = class_e_id
    if(exam_id) filter.exam_id = exam_id

    if(req.user.role_id === 'S'){
        const class_e = await db.user_class.findOne({
            where: { user_id: req.user.id}
        })
        const {count, rows} = await db.class_exam.findAndCountAll({
            where: {
                class_e_id: class_e.dataValues.class_e_id
            },
            ...req.pagination,
            include:[
                { model: db.class_e, as: 'class_e'},
                { model: db.exam, as: 'exam'}
            ]
        });
        res.set('Content-Range', rows.length).send({
            total: rows.length,
            data: rows
        })
    }
    else{
        if(type === 'class_e'){
            const {count, rows} = await db.class_exam.findAndCountAll({
                where: {
                    ...filter
                },
                ...req.pagination,
                include:[
                    { model: db.class_e, as: 'class_e', where: {
                        name: {[Op.substring]: textSearch}
                    }},
                    { model: db.exam, as: 'exam'}
                ]
            });
            res.set('Content-Range', count).send({
                total: count,
                data: rows
            })
        }
        else if(type === 'exam'){
            const {count, rows} = await db.class_exam.findAndCountAll({
                where: {
                    ...filter
                },
                ...req.pagination,
                include:[
                    { model: db.class_e, as: 'class_e'},
                    { model: db.exam, as: 'exam', where: {
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
            const {count, rows} = await db.class_exam.findAndCountAll({
                where: {
                    ...filter
                },
                ...req.pagination,
                include:[
                    { model: db.class_e, as: 'class_e'},
                    { model: db.exam, as: 'exam'}
                ]
            });
            res.set('Content-Range', count).send({
                total: count,
                data: rows
            })
        }
    }
}

const getById = async (req, res) => {
    const data = await db.class_exam.findOne({
        where:{id: req.params.id},
        include:[
            { model: db.class_e, as: 'class_e'},
            { model: db.exam, as: 'exam'}
        ]
    })
    if(!data) res.status(401).send('class_exam not found!')
    else res.send(data)
}

const getExamNotInClass = async (req, res) => {
    const {class_e_id} = req.query
    let filter = {}
    if (class_e_id) filter.class_e_id = class_e_id
    const class_exams = await db.class_exam.findAll({
        where: {
            ...filter
        }
    })
    const examIds = class_exams.map((class_exam) => class_exam.exam_id)
    const {count, rows} = await db.exam.findAndCountAll({
        where: {
            id: {
                [Op.notIn]: examIds
            }
        }
    })
    res.set('Content-Range', count).send({
        total: count,
        data: rows
    })
}

const create = async (req, res) => {
    const data = await db.class_exam.bulkCreate(req.body)
    res.send(data)
}

const update = async (req, res) => {
    const class_e = await db.class_exam.findOne({
        where:{class_e_id: req.params.class_e_id}
    });
    if(!class_e) res.status(404).send('class_e not found!');
    else {
        await db.class_exam.destroy({
            where: {class_e_id: req.params.class_e_id}
        });
        await db.class_exam.bulkCreate(req.body);
        res.send("class_exam successfully updated!");
    }
}

const deleteById = async (req, res) => {
    const data = await db.class_exam.findOne({
        where:{id: req.params.id}
    })
    if(!data) res.status(401).send('class_exam not found!')
    else {
        await db.class_exam.destroy({
            where:{id: req.params.id}
        })
        res.send("class_exam successfully deleted!")
    }
}

module.exports = {
    get,
    getById,
    getExamNotInClass,
    create,
    update,
    deleteById
}