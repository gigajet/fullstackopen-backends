const mongoose=require('mongoose')

if (process.argv.length!==3 && process.argv.length!==5) {
  console.log(`usage: ${process.argv.join(' ')} dbPassword`)
  console.log('list all persons in phonebook')
  console.log()
  console.log(`usage: ${process.argv.join(' ')} dbPassword name phone`)
  console.log('add new person with specified name and phone number')
  process.exit(1)
}

const password=process.argv[2]
const url=`mongodb+srv://nlm:${password}@cluster0.idpli.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema=mongoose.Schema({
  id: String,
  name: String,
  number: String,
})

const Person=mongoose.model('Person', personSchema)

const generateId=() => {
  return String(1+Math.floor(Math.random()*99999))
}

if (process.argv.length === 3) {
  Person.find({}).then(r => {
    console.log(r)
    console.log('phonebook:')
    const entryStrs=r.map(p => `${p.name} ${p.number}`)
    console.log(entryStrs.join('\n'))
    mongoose.connection.close()
  })
} else if (process.argv.length === 5) {
  const name=process.argv[3]
  const number=process.argv[4]
  const personObj=new Person({
    id: generateId(),
    name:name,
    number:number,
  })
  personObj.save().then(() => {
    console.log('saved',personObj)
    mongoose.connection.close()
  })
}
