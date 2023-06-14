const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e0s6hkf.mongodb.net/?retryWrites=true&w=majority`;

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


    const usersCollection = client.db("dance-club").collection("users");
    const instructorsCollection = client.db("dance-club").collection('instructors')
    const classCollection = client.db("dance-club").collection("class");
    const cartCollection = client.db("dance-club").collection("cart");
    const feedbackCollection = client.db("dance-club").collection("feedback");

      // user data
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });


    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;



      const query = { email: email }
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === 'admin' }
      res.send(result);
    })

    app.get('/users/instractor/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const user = await usersCollection.findOne(query);
      const result = { instractor: user?.role === 'instractor' }
      res.send(result);
    })


    app.patch('/user/admin/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };

      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);

    })
    app.patch('/user/instractor/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'instractor'
        },
      };

      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);

    })
    //  update 
    app.put('/updateStatus/:id', async (req, res) => {
      const { id } = req.params;
      const { status } = req.body;

      if (status !== 'approved' && status !== 'denied') {
        return res.status(400).send('Invalid status');
      }

      const updatedClass = await classCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status } },
        { returnOriginal: false }
      );

      if (!updatedClass.value) {
        return res.status(404).send('Class not found');
      }

      res.send(updatedClass.value);
    });


    app.post('/user', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: 'user already exists' })
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    // get my class
    app.get("/addclass", async (req, res) => {
      if (req.query?.email) {
        let query = {}
        query = { email: req.query.email }
        const result = await classCollection.find(query).toArray()
        return res.send(result)
      }
      const cursor = classCollection.find()
      const result = await cursor.limit(20).toArray()
      res.send(result)
    })

    //  get single id add class
    app.get('/addclass/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await classCollection.findOne(query)
      res.send(result)
    })

    // update class
    app.put("/addclass/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updateClass = req.body
      const classUpdate = {
        $set: {
          photo: updateClass.photo,
          price: updateClass.price,
          category: updateClass.category,
          seats: updateClass.seats
        },
      };
      const result = await classCollection.updateOne(filter, classUpdate, options)
      res.send(result)
    })
    // add class post
    app.post('/addclass', async (req, res) => {
      const addClass = req.body;
      const result = await classCollection.insertOne(addClass)
      res.send(result)
    })
    // cart collection
    app.get('/carts', async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    })


    // cart data post
    app.post("/carts", async (req, res) => {
      const item = req.body;
      const result = await cartCollection.insertOne(item);
      res.send(result);
    })


    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await cartCollection.deleteOne(query)
      res.send(result)
    })
    // admin feedback the instructor why he decline class
    app.post('/feedback', async (req, res) => {
      const course = req.body;
      const result = await feedbackCollection.insertOne(course);
      res.send(result);
    })

    app.get('/feedback', async (req, res) => {
      const result = await feedbackCollection.find().toArray()
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('school server is running')
})

app.listen(port, () =>{
    console.log(`school server port is running on ${port}`);
})