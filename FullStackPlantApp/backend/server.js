require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const client = new MongoClient(process.env.MONGO_URI);

app.use(cors());
app.use(express.json());

let plants;

// Read - get all plants
app.get('/api/plants', async (req, res) => {
  try {
    const records = await plants.find({}).toArray();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch plants' });
  }
});

// Create - add a plant
app.post('/api/plants', async (req, res) => {
  try {
    const { name, type } = req.body;

    if (typeof name !== 'string' || !name.trim() ||
        typeof type !== 'string' || !type.trim()) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const plant = { name: name.trim(), type: type.trim() };
    const result = await plants.insertOne(plant);

    res.status(201).json({ _id: result.insertedId, ...plant });
  } catch (error) {
    res.status(500).json({ error: 'Unable to add plant' });
  }
});

// Update - change a plant
app.put('/api/plants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid plant ID' });
    }

    if (typeof name !== 'string' || !name.trim() ||
        typeof type !== 'string' || !type.trim()) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const result = await plants.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name: name.trim(), type: type.trim() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    res.json({ message: 'Plant updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Unable to update plant' });
  }
});

// Delete - remove a plant
app.delete('/api/plants/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid plant ID' });
    }

    const result = await plants.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    res.json({ message: 'Plant deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Unable to delete plant' });
  }
});

async function startServer() {
  try {
    await client.connect();
    const db = client.db('GreenThumbDB');
    plants = db.collection('plants');

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log('Backend running on port ' + port);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

startServer();
