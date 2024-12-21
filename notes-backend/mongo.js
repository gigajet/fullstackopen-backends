const mongoose=require('mongoose')

if (process.argv.length<3) {
    console.log('give password as argument')
    process.exit(1)
}

const password=process.argv[2]
const url=`mongodb+srv://nlm:${password}@cluster0.idpli.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const noteSchema=mongoose.Schema({
    content: String,
    important: Boolean
})

const Note=mongoose.model('Note', noteSchema)

// const note=new Note({
//     content: 'HTML is easy',
//     important: true,
// })

// note.save().then(r=>{
//     console.log('note saved!')
//     mongoose.connection.close()
// })

Note.find({}).then(result => {
    result.forEach(note => {
      console.log(note)
    })
    mongoose.connection.close()
  })
