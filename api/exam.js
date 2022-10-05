const db = require('../utils/db')
const {Op} = require("sequelize")
const fs = require('fs')
const { getAudioDurationInSeconds } = require('get-audio-duration')
const subpart = require('../models/subpart')

const get = async (req, res) => {
    const {textSearch} = req.query;
    let filter = {};
    if(textSearch) {
        filter.name = {[Op.substring]: textSearch}
    }
    const {count, rows} = await db.exam.findAndCountAll({
        where: {
            ...filter
        },
        ...req.pagination,
        include: [
            {model: db.subpart, as: 'subparts', include: [
                {model: db.type_subpart, as: 'type_subpart', attributes: ['type'], include: {
                    model: db.part, as: 'part', attributes: ['name']
                }},
                {model: db.questions, as: 'questions', include: [
                    //{model: db.answer, as: 'answers'},
                ]}
            ]}
        ]
    });
    res.set('Content-Range', count).send({
        total: rows.length,
        data: rows
    })
}

const getById = async (req, res) => {
    if(req.user.role_id === 'S'){
        const data1 = await db.exam.findOne({
            where:{id: req.params.id},
            include: [
                {model: db.subpart, as: 'subparts', include: [
                    {model: db.type_subpart, as: 'type_subpart', attributes: ['type'],
                        where: {
                            [Op.or]: [
                                { type: 'Choose the correct letter, A, B or C'},
                                { type: 'Choose TWO letters, A-E' }
                            ]
                        }, 
                        include: {
                            model: db.part, as: 'part', attributes: ['name']
                    }},
                    {model: db.questions, as: 'questions', include: {
                        model: db.answer, as: 'answers', attributes: ['answer']
                    }}
                ]},
                {model: db.class_exam, as: 'class_exams', required: true, include: {
                    model: db.class_e, as: 'class_e', include: {
                        model: db.user_class, as: 'user_classes', where: {
                            user_id: req.user.id
                        } 
                    }
                }}
            ]
        })
        const subpartsID = data1.dataValues.subparts.map(sp => sp.id)
        const data2 = await db.exam.findOne({
            where:{id: req.params.id},
            include: [
                {model: db.subpart, as: 'subparts', 
                    where: {
                        id: {
                            [Op.notIn]: subpartsID
                        }
                    },
                    include: [
                        {model: db.type_subpart, as: 'type_subpart', attributes: ['type'], include: {
                                model: db.part, as: 'part', attributes: ['name']
                        }},
                        {model: db.questions, as: 'questions', include: {
                            model: db.answer, as: 'answers', attributes: ['id']
                        }}
                ]},
                {model: db.class_exam, as: 'class_exams', required: true, include: {
                    model: db.class_e, as: 'class_e', include: {
                        model: db.user_class, as: 'user_classes', where: {
                            user_id: req.user.id
                        } 
                    }
                }}
            ]
        })
        const data = data1.dataValues.subparts.concat(data2.dataValues.subparts)
        let subparts = await Promise.all(data.map(async (d) => {
            var arr = []
            if(d.file) {
                const subpart = {
                    'id': d.id,
                    'name': d.name,
                    'content': d.content,
                    'exam_id': d.exam_id,
                    'type_subpart_id': d.type_subpart_id,
                    'file': d.file,
                    'file_time': Math.round(await getAudioDurationInSeconds('public/'.concat(d.file))),
                    'image': d.image,
                    'type_subpart': d.type_subpart,
                    'questions': d.questions
                }
                arr.push(subpart)
            }
            else {
                const subpart = {
                    'id': d.id,
                    'name': d.name,
                    'content': d.content,
                    'exam_id': d.exam_id,
                    'type_subpart_id': d.type_subpart_id,
                    'file': d.file,
                    'image': d.image,
                    'type_subpart': d.type_subpart,
                    'questions': d.questions
                }
                arr.push(subpart)
            }
            return arr[0]
        }))
        
        if(!data) res.status(401).send('exam not found!')
        else res.send({
            id: data1.dataValues.id,
            name: data1.dataValues.name,
            reading_time: data1.dataValues.reading_time,
            writing_time: data1.dataValues.writing_time,
            subparts: subparts
        })
    }
    else {
        const data = await db.exam.findOne({
            where:{id: req.params.id},
            include: [
                {model: db.subpart, as: 'subparts', include: [
                    {model: db.type_subpart, as: 'type_subpart', attributes: ['type'], include: {
                        model: db.part, as: 'part', attributes: ['name']
                    }},
                    {model: db.questions, as: 'questions', include: {
                        model: db.answer, as: 'answers'
                    }}
                ]}
            ]
        })
        if(!data) res.status(401).send('exam not found!')
        else res.send(data)
    }
}

const getTrueById = async (req, res) => {
    const exam = await db.exam.findOne({
        where:{id: req.params.id},
        include: [
            {model: db.subpart, as: 'subparts', include: [
                {model: db.type_subpart, as: 'type_subpart', attributes: ['type'], include: {
                    model: db.part, as: 'part', attributes: ['name']
                }},
                {model: db.questions, as: 'questions', required: true, include: {
                    model: db.answer, as: 'answers', where: {
                        correct: 1
                    }
                }}
            ]}
        ]
    })
    const isTrue = exam.dataValues.subparts.map(e => {
        const subpart = {
            'id': e.dataValues.id,
            'name': e.dataValues.name,
            'total': e.dataValues.questions.length,
            'questions': e.dataValues.questions,
            'type_subpart': e.dataValues.type_subpart
        }
        return subpart
    })
    if(!exam) res.status(401).send('exam not found!')
    else res.send(isTrue)
}

const create = async (req, res) => {
    const data = await db.exam.create(req.body)
    res.send(data)
}

const update = async (req, res) => {
    const data = await db.exam.findOne({
        where:{id: req.params.id}
    })
    if(!data) res.status(401).send('exam not found!')
    else {
        await db.exam.update({...req.body},{
            where:{id: req.params.id}
        })
        res.send("exam successfully updated!")
    }
}

const deleteById = async (req, res) => {
    const data = await db.exam.findOne({
        where:{id: req.params.id}
    })
    if(!data) res.status(401).send('exam not found!')
    else {
        await db.exam.destroy({
            where:{id: req.params.id},
        })
        await db.user_exam.destroy({
            where:{exam_id: {
                [Op.is]: null
            }}
        })
        await db.subpart.destroy({
            where:{exam_id: {
                [Op.is]: null
            }}
        })
        await db.class_exam.destroy({
            where:{exam_id: {
                [Op.is]: null
            }}
        })
        await db.questions.destroy({
            where:{subpart_id: {
                [Op.is]: null
            }}
        })
        await db.answer.destroy({
            where:{question_id: {
                [Op.is]: null
            }}
        })
        res.send("exam successfully deleted!")
    }
}

const search = async (req, res) => {
    const {name} = req.query;
    const {count, rows} = await db.exam.findAndCountAll({
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
    getTrueById,
    create,
    update,
    deleteById,
    search
}