const mongoose=require('mongoose')

const url=process.env.MONGODB_URI
console.log('Connecting to',url)

mongoose.set('strictQuery', false)
mongoose
    .connect(url)
    .then(r=>console.log('connected to MongoDB'))
    .catch(e=>console.log('Error connecting to MongoDB:',e))

const phoneCharacterValidator=number=>{
    return /[\d-]+/.test(number)
}
const phoneNumberValidator=number=>{
    const parts=number.split('-')
    console.log(parts[0],parts[0].length)
    return (parts.length===2) && (parts[0].length>=2 && parts[0].length<=3)
}

const personSchema=mongoose.Schema({
    name: {
        type: String,
        minlength: [3, 'name must be at least 3 characters'],
        required: [true, 'missing required name field'],
    },
    number: {
        type: String,
        required: [true, 'missing required number field'],
        minlength: [8, 'phone number length have at least 8 characters'],
        validate:[
            {
                validator: phoneCharacterValidator,
                message: 'phone number must consist of digits and hyphens (-)'
            },
            {
                validator: phoneNumberValidator,
                message: 'phone number must have form XX-YY... or XXX-YY...',
            },
        ],
    }
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
