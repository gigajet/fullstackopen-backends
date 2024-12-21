require('dotenv').config()
const express=require('express')
const cors=require('cors')
const app=express()
const Person=require('./models/person')
const morgan=require('morgan')
app.use(express.json())
app.use(express.static('dist'))
app.use(cors())

app.use(morgan('tiny', {
    skip: (r,s)=>{return r.method === 'POST'}
}))
morgan.token('person', (r,s)=>{return JSON.stringify(r.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person', {
    skip: (r,s)=>{ return r.method !== 'POST' }
}))

// let persons=[
//     { 
//       "id": "1",
//       "name": "Arto Hellas", 
//       "number": "040-123456"
//     },
//     { 
//       "id": "2",
//       "name": "Ada Lovelace", 
//       "number": "39-44-5323523"
//     },
//     { 
//       "id": "3",
//       "name": "Dan Abramov", 
//       "number": "12-43-234345"
//     },
//     { 
//       "id": "4",
//       "name": "Mary Poppendieck", 
//       "number": "39-23-6423122"
//     }
// ]

app.get('/', (r,s)=>{ /* Request and response */
    return s.send('<h1>Phonebook backend application</h1>')
})

app.get('/api/persons',(r,s)=>{
    Person.find({}).then(p=>{
        s.json(p)
    })
})

app.get('/info', (request,response)=>{
    Person.countDocuments()
        .then(count=>{
            const resp=`<p>Phonebook has info for ${count} people</p>
            <p>${new Date()}</p>`
            return response.send(resp)
        })
})

app.get('/api/persons/:id', (request,response,next)=>{
    const id=request.params.id
    Person.findById(id)
        .then(p=>{
            if (p) {
                response.json(p)
            } else {
                response.status(404).end()
            }
        })
        .catch(e=>next(e))
})

app.put('/api/persons/:id', (request, response, next)=>{
    const id=request.params.id
    const body=request.body
    if (!body.name) {
        response.status(400).json({
            error: 'missing required "name" property'
        })
    } else if (!body.number) {
        response.status(400).json({
            error: 'missing required "number" property'
        })
    } else {
        const newPerson={
            name: body.name,
            number: body.number,
        }
        Person.findByIdAndUpdate(id, newPerson, {new: true})
            .then(updatedPerson=> {
                response.json(updatedPerson)
            }).catch(e=>next(e))
    }
})

app.delete('/api/persons/:id', (r,s,next)=>{
    const id=r.params.id
    Person.findByIdAndDelete(id)
        .then(res=>{
            s.status(204).end()
        }).catch(e=>next(e))
})

app.post('/api/persons', (r,s)=>{
    const body=r.body
    if (!body.name) {
        s.status(400).json({
            error: 'missing required "name" property'
        })
    } else if (!body.number) {
        s.status(400).json({
            error: 'missing required "number" property'
        })
    } else {
        const p=new Person({
            name: body.name,
            number: body.number,
        })
        p.save()
            .then(person=>{
                s.status(201).json(person)
            })
    }
})

const unknownEndpoint=(request,response)=>{
    response.status(404).json({error: 'unknown endpoint'})
}
app.use(unknownEndpoint)

const errorHandler=(error, request,response,next)=>{
    if (error.name==='CastError') {
        return response.status(400).json({error:'malformatted id'})
    }
    next(error)
}
app.use(errorHandler)

const PORT=process.env.PORT || 3001
app.listen(PORT)
