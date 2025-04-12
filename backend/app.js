const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/realestate", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the Schema
const PropertySchema = new mongoose.Schema({
  tokenId: Number,
  owner: String,
  location: String,
  price: String,
  transactions: [
    {
      from: String,
      to: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

// Create the Model
const Property = mongoose.model("Property", PropertySchema);

// GET all properties
app.get("/properties", async (_, res) => {
  try {
    const props = await Property.find();
    res.json(props);
  } catch (err) {
    res.status(500).json({ error: "Error fetching properties" });
  }
});

// POST a new property
app.post("/properties", async (req, res) => {
  try {
    const newProp = new Property(req.body);
    await newProp.save();
    res.json(newProp);
  } catch (err) {
    res.status(400).json({ error: "Error saving property" });
  }
});

// POST a new transaction (update transaction history)
app.post("/transactions", async (req, res) => {
  try {
    const { tokenId, from, to } = req.body;
    const property = await Property.findOne({ tokenId });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    property.transactions.push({ from, to });
    await property.save();

    res.json(property);
  } catch (err) {
    res.status(400).json({ error: "Error logging transaction" });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
