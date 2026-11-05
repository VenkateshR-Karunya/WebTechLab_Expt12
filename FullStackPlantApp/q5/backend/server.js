require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const client = new MongoClient(process.env.MONGO_URI);

app.use(cors());
app.use(express.json());

let plants;

// All three fields must be non-empty text
function isValid({ plantCode, name, type }) {
  return [plantCode, name, type].every(
    (value) => typeof value === 'string' && value.trim() !== ''
  );
}

// Read - get all plants, or search by type: /api/plants?type=Flower
app.get('/api/plants', async (req, res) => {
  try {
    const filter = {};

    if (typeof req.query.type === 'string' && req.query.type.trim()) {
      // Escape special characters, then match the text anywhere, ignoring case
      const text = req.query.type.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.type = { $regex: text, $options: 'i' };
    }

    const records = await plants.find(filter).toArray();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch plants' });
  }
});

// Create - add a plant
app.post('/api/plants', async (req, res) => {
  try {
    if (!isValid(req.body)) {
      return res.status(400).json({ error: 'Plant code, name and type are required' });
    }

    const plant = {
      plantCode: req.body.plantCode.trim(),
      name: req.body.name.trim(),
      type: req.body.type.trim()
    };
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

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid plant ID' });
    }

    if (!isValid(req.body)) {
      return res.status(400).json({ error: 'Plant code, name and type are required' });
    }

    const result = await plants.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          plantCode: req.body.plantCode.trim(),
          name: req.body.name.trim(),
          type: req.body.type.trim()
        }
      }
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
