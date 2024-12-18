const express=require('express')
const cors=require('cors')
const app=express()
const morgan=require('morgan')
app.use(express.json())
app.use(cors())

app.use(morgan('tiny', {
    skip: (r,s)=>{return r.method === 'POST'}
}))
morgan.token('person', (r,s)=>{return JSON.stringify(r.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person', {
    skip: (r,s)=>{ return r.method !== 'POST' }
}))

let persons=[
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (r,s)=>{ /* Request and Sink */
    return s.send('<h1>Phonebook backend application</h1>')
})

app.get('/api/persons',(r,s)=>{
    return s.json(persons)
})

app.get('/info', (r,s)=>{
    const resp=`<p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>`
    return s.send(resp)
})

app.get('/api/persons/:id', (r,s)=>{
    const id=r.params.id
    console.log(`/api/persons/${id}`,r.headers)
    const person=persons.find(p=>p.id===id)
    if (person) {
        return s.json(person)
    } else {
        return s.status(404).send('404 Not found')
    }
})

app.delete('/api/persons/:id', (r,s)=>{
    const id=r.params.id
    persons=persons.filter(p=>p.id!==id)
    s.status(204).end()
})

const generateId=()=>{
    return String(1+Math.floor(Math.random()*99999))
}

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
    } else if (persons.find(p=>p.name===body.name)) {
        s.status(400).json({
            error: 'name must be unique'
        })
    } else {
        const person={
            id: generateId(),
            name: body.name,
            number: body.number,
        }
        persons=persons.concat(person)
        s.status(201).json(person)
    }
})

const PORT=process.env.PORT || 3001
app.listen(PORT)
