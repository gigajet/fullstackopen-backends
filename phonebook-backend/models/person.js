const mongoose=require('mongoose')

mongoose.set('strictQuery', false)
mongoose
    .connect(process.env.MONGODB_URI)
    .then(r=>console.log('connected to MongoDB'))
    .catch(e=>console.log('Error connecting to MongoDB:',e))

const personSchema=mongoose.Schema({
    name: String,
    number: String,
})
personSchema.set('toJSON',{
    transform: (doc, ret)=>{
        ret.id=ret._id.toString()
        delete ret._id
        delete ret.__v
    }
})

const Person=mongoose.model('Person', personSchema)

module.exports=Person
