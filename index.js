const express = require("express");
const cors = require("cors");
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// connect to the database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wh888.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);
async function run() {
    try {
        await client.connect();
        const database = client.db("shopMore");
        const productsCollection = database.collection("products");
        const usersCollection = database.collection("users");
        const ordersCollection = database.collection("orders");
        const reviewCollection = database.collection("reviews");


        // get all products from db
        app.get('/products', async (req, res) => {
            const products = await productsCollection.find({}).toArray();
            res.json(products);
        })

        //get a single product
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id
            const product = await productsCollection.findOne({ _id: ObjectId(id) });
            res.json(product);
        })

        //add new products to the db
        app.post('/products', async (req, res) => {
            const products = await productsCollection.insertOne(req.body);
            res.json(products);
        })

        //remove a product from db
        app.delete('/removeProducts/:id', async (req, res) => {
            const id = req.params.id;
            const result = await productsCollection.deleteOne({ _id: ObjectId(id) });
            res.json(result);
        })

        // save a sign up user
        app.post('/saveUser', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        // get an admin
        app.get('/saveUser/:email', async (req, res) => {
            const email = req.params.email;
            const result = await usersCollection.findOne({ email: email });
            let isAdmin = false;
            if (result?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // add an admin
        app.put('/makeAdmin/:email', async (req, res) => {
            const email = req.params.email;
            const query = await usersCollection.findOne({ email: email });
            if (query) {
                const updatedDoc = {
                    $set: {
                        role: 'admin',
                    }
                }
                const result = await usersCollection.updateOne(query, updatedDoc);
                res.json(result);
            }
            else {
                res.status(403).json({ message: 'You do not have permission to make admin' })
            }
        })


        //add orders to the db
        app.post('/order', async (req, res) => {
            const orders = await ordersCollection.insertOne(req.body);
            res.json(orders);
        })

        //get orders from the db
        app.get('/allOrders', async (req, res) => {
            const orders = await ordersCollection.find().toArray();
            res.json(orders);
        })


        //get orders from the db
        app.get('/myOrder/:email', async (req, res) => {
            const email = req.params.email;
            const orders = await ordersCollection.find({ email: email }).toArray();
            res.json(orders);
        })

        //remove a order from db
        app.delete('/removeOrder/:id', async (req, res) => {
            const id = req.params.id;
            const result = await ordersCollection.deleteOne({ _id: ObjectId(id) });
            res.json(result);
        })

        // update status

        // find specific order to update
        app.get("/allOrders/:id", async (req, res) => {
            const id = req.params.id;
            const result = await ordersCollection.findOne({ _id: ObjectId(id) });
            res.send(result);
        });
        // status update
        app.put("/allOrders/:id", async (req, res) => {
            const id = req.params.id;
            const updateStatus = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: updateStatus.status,
                },
            };
            const result = await ordersCollection.updateOne(
                filter,
                updateDoc,
            );
            res.json(result);
        });

        // load reviews data
        app.get('/reviews', async (req, res) => {
            const reviews = await reviewCollection.find({}).toArray();
            res.json(reviews);
        })

        // save reviews data
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

    }

    finally {
        // await client.close();
    }
}
run().catch(console.dir)

// check the server is running or not
app.get("/", (req, res) => {
    res.send("Server running successfully");
});

app.listen(port, () => {
    console.log("listening on port", port);
});
