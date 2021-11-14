const express = require("express");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const app = express();
const { MongoClient } = require("mongodb");
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sd44u.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("bike_zone");
    const bikeCollection = database.collection("bikes");
    const cartCollection = database.collection("cart");
    const userCollection = database.collection("users");
    const reviewCollection = database.collection("review");

    // get all bike data

    app.get("/bikes", async (req, res) => {
      const bike = bikeCollection.find({});
      const result = await bike.toArray();
      res.send(result);
    });

    // get a single bike info

    app.get("/bikes/:id", async (req, res) => {
      const id = req.params.id;
      console.log("getting specific bike", id);
      const query = { _id: ObjectId(id) };
      const result = await bikeCollection.findOne(query);
      res.json(result);
    });

    // adding data to bikes collection

    app.post("/bikes", async (req, res) => {
      const bike = req.body;
      const result = await bikeCollection.insertOne(bike);
      res.json(result);
    });

    // delete a data from bikes

    app.delete("/bikes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bikeCollection.deleteOne(query);
      res.json(result);
    });

    //get all cart data

    app.get("/cart", async (req, res) => {
      const cart = cartCollection.find({});
      const result = await cart.toArray();
      res.send(result);
    });

    // add data to cart

    app.post("/cart", async (req, res) => {
      const bike = req.body;
      const result = await cartCollection.insertOne(bike);
      res.json(result);
    });

    // delete data from cart

    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.json(result);
    });

    // get all review info

    app.get("/review", async (req, res) => {
      const review = reviewCollection.find({});
      const result = await review.toArray();
      res.send(result);
    });

    //add user review

    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });

    // get cart data

    app.get("/cart/:uid", async (req, res) => {
      const uid = req.params.uid;
      const query = { uid: uid };
      const result = await cartCollection.find(query).toArray();
      res.json(result);
    });

    // add user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.json(result);
    });

    // searching unique email
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // admin role 
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      // console.log('put',user);
          const filter = { email: user.email };
          const updateDoc = { $set: { role: "admin" } };
          const result = await userCollection.updateOne(filter, updateDoc);
          res.json(result);
      });

      // get email from users
      app.get("/users/:email", async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await userCollection.findOne(query);
        // console.log(user);
        let isAdmin = false;
        if (user?.role === "admin") {
          isAdmin = true;
        }
        res.json({ admin: isAdmin });
      });
  }
  finally {
    // await client.close()
  }

}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Bike Zone!");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});