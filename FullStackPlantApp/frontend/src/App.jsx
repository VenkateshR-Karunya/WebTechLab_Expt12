import { useEffect, useState } from 'react';
import './App.css';

const API = 'http://localhost:5000/api/plants';

function App() {
  const [plants, setPlants] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');

  async function loadPlants() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error('Unable to load plants');
      setPlants(await response.json());
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadPlants();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    try {
      const response = await fetch(
        editId ? `${API}/${editId}` : API,
        {
          method: editId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, type })
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setName('');
      setType('');
      setEditId(null);
      setMessage(data.message || 'Plant added successfully');
      await loadPlants();
    } catch (error) {
      setMessage(error.message || 'Request failed');
    }
  }

  function editPlant(plant) {
    setEditId(plant._id);
    setName(plant.name);
    setType(plant.type);
    setMessage('');
  }

  async function deletePlant(id) {
    if (!window.confirm('Delete this plant?')) return;

    try {
      const response = await fetch(`${API}/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setMessage(data.message);
      await loadPlants();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <main className="container">
      <h1>🌿 The Green Thumb Journal</h1>
      <h2>Plant Management System</h2>
      <p className="subtitle">Frontend: React.js · Backend: Node.js · Database: MongoDB</p>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Plant Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          placeholder="Type (Flower, Herb...)"
          value={type}
          onChange={e => setType(e.target.value)}
          required
        />
        <button type="submit">
          {editId ? 'Update Plant' : 'Add Plant'}
        </button>
        {editId && (
          <button
            type="button"
            className="cancel"
            onClick={() => {
              setEditId(null);
              setName('');
              setType('');
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {message && <p role="status">{message}</p>}

      <h2>Plant Records</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {plants.map(plant => (
            <tr key={plant._id}>
              <td>{plant.name}</td>
              <td>{plant.type}</td>
              <td>
                <button onClick={() => editPlant(plant)}>Edit</button>
                <button className="delete" onClick={() => deletePlant(plant._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

export default App;
