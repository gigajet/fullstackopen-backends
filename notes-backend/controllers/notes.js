const notesRouter=require('express').Router()
const Note=require('../models/note')
const logger=require('../utils/logger')

notesRouter.get('/', (request, response)=> {
    Note.find({}).then(notes => {
        response.json(notes)
    })
})

notesRouter.get('/:id', (request, response, next)=>{
    const id=request.params.id
    Note.findById(id).then(note=>{
        if (note) {
            response.json(note)
        } else {
            response.status(404).end()
        }
    }).catch(e=>next(e))
})

notesRouter.post('/', (request, response, next)=>{
    const body=request.body
    const note = new Note({
        content: body.content,
        important: body.important || false,
    })

    note.save().then(savedNote => {
        response.json(savedNote)
    }).catch(e=>next(e))
})

notesRouter.delete('/:id', (req, res,next)=>{
    const id=req.params.id
    Note.findByIdAndDelete(id)
        .then(()=>{
            res.status(204).end()
        }).catch(e=>next(e))
})

notesRouter.put('/:id', (request, response, next)=>{
    const {content, important} = request.body

    Note.findByIdAndUpdate(request.params.id, 
        {content, important}, 
        {new: true, runValidators: true, context: 'query'}
    ).then(updatedNote=>{
        response.json(updatedNote).end()
    }).catch(e=>next(e))
})

module.exports = notesRouter
