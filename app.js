const mongoose = require('mongoose')
const Document=require('./Document')




const PORT=process.env.PORT || 3001



const connect=async ()=>{
    mongoose.connect('mongodb+srv://mohammadzafeer2610:esmGOizl74ppzwRm@google-docs-clone.7g98h.mongodb.net/?retryWrites=true&w=majority&appName=google-docs-clone').then(()=>console.log('Database connected successfully')).catch((err)=>console.log(err));
}
connect()


const io=require('socket.io')(PORT,{
    cors: {
        origin: ['https://googledocsclone-frontend.onrender.com'],
        methods: ['GET', 'POST']
    }
})

io.on('connection',socket=>{
    socket.on('get-document',async documentId=>{
        const document=await findOrCreateDocument(documentId)
        socket.join(documentId)
        socket.emit('load-document',document.data)

        socket.on('send-changes',delta=>{
            socket.broadcast.to(documentId).emit('recieve-changes',delta)
        })

        socket.on('save-document',async data=>{
            await Document.findByIdAndUpdate(documentId,{data})
        })
    })
   
})

const defaultValue=''
async function findOrCreateDocument(id){
    if(id==null) return

    const document=await Document.findById(id)
    if(document)return document
    return await Document.create({_id:id,data:defaultValue})
}
