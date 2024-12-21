require('dotenv').config()
const express = require('express')
const app = express()
const Note=require('./models/note')
const cors = require('cors')
app.use(express.json())
app.use(express.static('dist'))
app.use(cors())


// let notes=[
//     {
//         id: "1",
//         content: "HTML is easy",
//         important: true
//     },
//     {
//         id: "2",
//         content: "Browser can execute only Javascript",
//         important: false,
//     },
//     {
//         id: "3",
//         content: "GET and POST are most important methods of HTTP protocol",
//         important: true,
//     },
// ]

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }

app.use(requestLogger)

app.get('/', (request, response)=> {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response)=>{
    Note.find({}).then(notes => {
        response.json(notes)
    })
})

app.get('/api/notes/:id', (request, response, next)=>{
    const id=request.params.id
    Note.findById(id).then(note=>{
        if (note) {
            response.json(note)
        } else {
            response.status(404).end()
        }
    }).catch(e=>next(e))
})

app.put('/api/notes/:id', (request, response, next)=>{
    const {content, important} = request.body

    Note.findByIdAndUpdate(request.params.id, 
        {content, important}, 
        {new: true, runValidators: true, context: 'query'}
    ).then(updatedNote=>{
        response.json(updatedNote).end()
    }).catch(e=>next(e))
})

app.delete('/api/notes/:id', (req, res,next)=>{
    const id=req.params.id
    Note.findByIdAndDelete(id)
        .then(result=>{
            res.status(204).end()
        }).catch(e=>next(e))
})

app.post('/api/notes', (request, response, next)=>{
    const body=request.body
    if (!body.content) {
        return response.status(400).json({
            error: 'content missing'
        })
    }
    const note = new Note({
        content: body.content,
        important: body.important || false,
    })

    note.save().then(savedNote => {
        response.json(savedNote)
    }).catch(e=>next(e))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)

const errorHandler=(error,request,response,next)=>{
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({error: error.message})
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
