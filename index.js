const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
//Must remove "/" from your production URL
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://hostel-management-client.web.app",
      "https://euphonious-shortbread-98a6aa.netlify.app",
    ],
  })
);
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    // await client.connect();

    const userCollection = client.db("mealsDb").collection("users");
    const mealsCollection = client.db("mealsDb").collection("meals");
    const likesCollection = client.db("mealsDb").collection("likes");
    const reviewsCollection = client.db("mealsDb").collection("reviews");
    const requestedMealCollection = client
      .db("mealsDb")
      .collection("requestedMeal");

    // user related apu
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      console.log(user);
      try {
        const existingUser = await userCollection.findOne(query);
        if (existingUser) {
          return res.send({ message: "user already exist", insertedId: null });
        } else {
          const result = await userCollection.insertOne(user);
          console.log(result);
          res.send(result);
        }
      } catch {
        res.status(500).send({ error: "Failed to requested users data" });
      }
    });

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
        const result = await likesCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to review meal" });
      }
    });

    // request Meal related api
    app.post("/requestedMeal", async (req, res) => {
      const requestedMeal = req.body;
      // console.log(requestedMeal);
      const query = {
        mealTitle: requestedMeal.mealTitle,
        userEmail: requestedMeal.userEmail,
      };
      try {
        const existingRequest = await requestedMealCollection.findOne(query);
        if (existingRequest) {
          res
            .status(400)
            .send({ error: "You have already requested this meal" });
        } else {
          const result = await requestedMealCollection.insertOne(requestedMeal);
          res.send(result);
        }
      } catch (error) {
        res.status(500).send({ error: "Failed to requested meal" });
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

    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id)
      const query = { _id: new ObjectId(id) };
      try {
        const result = await reviewsCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to review meal" });
      }
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
