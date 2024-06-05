const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = 5000;
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ml8mugs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const mealsCollection = client.db("mealsDb").collection("meals");
    const likesCollection = client.db("mealsDb").collection("likes");
    const reviewsCollection = client.db("mealsDb").collection("reviews");

    // Meals related API
    app.get("/meals", async (req, res) => {
      try {
        const result = await mealsCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch meals" });
      }
    });

    app.get("/meals/:id", async (req, res) => {
      const id = parseFloat(req.params.id);
      const query = { id: id };
      try {
        const result = await mealsCollection.findOne(query);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch meal" });
      }
    });

    // Likes related api
    app.post("/likes", async (req, res) => {
      const likeItem = req.body;
      console.log(likeItem);
      const query = {
        mealTitle: likeItem.mealTitle,
        userEmail: likeItem.userEmail,
      };
      try {
        const existingLike = await likesCollection.findOne(query);
        if (existingLike) {
          res.status(400).send({ error: "You have already liked this meal" });
        } else {
          const result = await likesCollection.insertOne(likeItem);
          res.send(result);
        }
      } catch (error) {
        res.status(500).send({ error: "Failed to like meal" });
      }
    });

    app.get("/likes", async (req, res) => {     
      try {
        const result = await likesCollection.find().toArray()
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to review meal" });
      }
    });

    // review related api Collection
    app.post("/reviews", async (req, res) => {
      const reviewItem = req.body;
      console.log(reviewItem);
      try {
        const result = await reviewsCollection.insertOne(reviewItem);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to review meal" });
      }
    });
    app.get("/reviews", async (req, res) => {     
      try {
        const result = await reviewsCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to review meal" });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Hostel Management!");
});

app.listen(port, () => {
  console.log(`Hostel management server running on port ${port}`);
});
