const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
require('dotenv').config()
const cors = require('cors');
const port = process.env.PORT || 5000
const app = express()

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.p43vn94.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
   
    const toyCollection = client.db("toyStore").collection("toys")

    //seach index
    const indexKey = {name: 1}
    const indexOption = {indexName: "toyName"}
    const result = await toyCollection.createIndex(indexKey, indexOption)
    console.log(result) 

    //total toys
    app.get('/totaltoys', async(req, res)=>{
         const result = await toyCollection.estimatedDocumentCount()
         res.send({totalItems: result})
    })

    app.get('/all-toys', async(req, res)=>{
      const page = parseInt(req.query?.page) || 0
      const limit = parseInt(req.query?.limit) || 20
      const skip = page* limit
      const result = await toyCollection.find().skip(skip).limit(limit).toArray()
      res.send(result)
   })

    app.get('/gettoybyname/:text', async(req, res)=>{
      const text = req.params.text
      const result = await toyCollection.find({name:{ $regex: text, $options: "i" } }).toArray()
      res.send(result)
    })

    //upload toy
    app.post('/upload-toy', async(req, res)=>{
      const data = req.body
      const result = await toyCollection.insertOne(data)
      res.send(result)
    })

    //my toys
    app.get('/mytoys', async(req, res)=>{
      let query = {}
      if(req.query?.email){
        query = {
          sellerEmail: req.query.email}
      }
      const result = await toyCollection.find(query).toArray()
      res.send(result)
    })

    //update toy get rout
    app.get('/toyinfo/:id', async(req, res)=>{
      const id = req.params.id
      console.log(id)
      const query = {_id: new ObjectId(id)}
      const result = await toyCollection.findOne(query)
      res.send(result)
    })
    //update route
    app.patch('/updatetoy/:id', async(req, res)=>{
      const id = req.params.id
      const filter = {_id: new ObjectId(id)}
      const updateToy = req.body
      const updatedDoc = {
         $set: {...updateToy}
      }
      const result = await toyCollection.updateOne(filter, updatedDoc)
      res.send(result)
    })

    //delete route
    app.delete('/delete/:id', async(req, res)=>{
      const id = req.params.id
      const filter = {_id: new ObjectId(id)}
      const result = await toyCollection.deleteOne(filter)
      res.send(result)
    })

//rout for gellery and all toys
   app.get('/all-toys', async(req, res)=>{
      const result = await toyCollection.find().toArray()
      res.send(result)
   })

   //rout for shop by category
   app.get('/by-category/:text', async(req, res)=>{
      const body = req.params.text
      const query = {category: req.params.text }
      const result = await toyCollection.find(query).toArray()
      res.send(result)
   })

   //Rought for toy details
   app.get('/toydetails/:id', async(req, res)=>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await toyCollection.findOne(query)
      res.send(result)
   })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   //  await client.close();
  }
}
run().catch(console.dir);






app.listen(port, (req, res)=>{
   console.log(`The server is running on the port of ${port}`)
})

app.get('/', (req, res)=>{
  res.send("ok everythisn")
})