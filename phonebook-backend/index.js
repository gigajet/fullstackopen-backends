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
  skip: (request) => { return request.method === 'POST'}
}))
morgan.token('person', (_request,response) => { return JSON.stringify(response.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person', {
  skip: (request) => { return request.method !== 'POST' }
}))

// let persons=[
//   {
//     "id": "1",
//     "name": "Arto Hellas",
//     "number": "040-123456"
//   },
//   {
//     "id": "2",
//     "name": "Ada Lovelace",
//     "number": "39-44-5323523"
//   },
//   {
//     "id": "3",
//     "name": "Dan Abramov",
//     "number": "12-43-234345"
//   },
//   {
//     "id": "4",
//     "name": "Mary Poppendieck",
//     "number": "39-23-6423122"
//   }
// ]

app.get('/', (request,response) => {
  return response.send('<h1>Phonebook backend application</h1>')
})

app.get('/api/persons',(request,response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request,response) => {
  Person.countDocuments()
    .then(count => {
      const resp=`<p>Phonebook has info for ${ count } people</p>
      <p>${ new Date()}</p>`
      return response.send(resp)
    })
})

app.get('/api/persons/:id', (request,response,next) => {
  const id=request.params.id
  Person.findById(id)
    .then(p => {
      if (p) {
        response.json(p)
      } else {
        response.status(404).end()
      }
    })
    .catch(e => next(e))
})

app.put('/api/persons/:id', (request, response, next) => {
  const id=request.params.id
  const { name, number }=request.body
  const newPerson={
    name: name,
    number: number,
  }
  Person.findByIdAndUpdate(id, newPerson, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).end()
      }
    }).catch(e => next(e))
})

app.delete('/api/persons/:id', (request,response,next) => {
  const id=request.params.id
  Person.findByIdAndDelete(id)
    .then(() => {
      response.status(204).end()
    }).catch(e => next(e))
})

app.post('/api/persons', (request,response,next) => {
  const { name, number }=request.body
  const p=new Person({
    name: name,
    number: number,
  })
  p.save()
    .then(person => {
      response.status(201).json(person)
    }).catch(error => next(error))
})

const unknownEndpoint=(request,response) => {
  response.status(404).json({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler=(error, request,response,next) => {
  console.log('errorHandler',error)
  if (error.name==='CastError') {
    return response.status(400).json({ error:'malformatted id' })
  } else if (error.name==='ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

const PORT=process.env.PORT || 3001
app.listen(PORT)
