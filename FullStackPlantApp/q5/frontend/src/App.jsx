import { useEffect, useState } from 'react';
import './App.css';

const API = 'http://localhost:5000/api/plants';

function App() {
  const [plants, setPlants] = useState([]);
  const [plantCode, setPlantCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');

  // Load all plants, or only the plants whose type matches the search text
  async function loadPlants(searchText = search) {
    try {
      const url = searchText.trim()
        ? `${API}?type=${encodeURIComponent(searchText.trim())}`
        : API;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Unable to load plants');
      setPlants(await response.json());
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadPlants('');
  }, []);

  function clearForm() {
    setPlantCode('');
    setName('');
    setType('');
    setEditId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    try {
      const response = await fetch(
        editId ? `${API}/${editId}` : API,
        {
          method: editId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plantCode, name, type })
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      clearForm();
      setMessage(data.message || 'Plant added successfully');
      await loadPlants();
    } catch (error) {
      setMessage(error.message || 'Request failed');
    }
  }

  function editPlant(plant) {
    setEditId(plant._id);
    setPlantCode(plant.plantCode || '');
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

  function handleSearch(event) {
    event.preventDefault();
    loadPlants();
  }

  function clearSearch() {
    setSearch('');
    loadPlants('');
  }

  return (
    <main className="container">
      <h1>🌿 The Green Thumb Journal</h1>
      <h2>Plant Management System</h2>
      <p className="subtitle">Frontend: React.js · Backend: Node.js · Database: MongoDB</p>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Plant Code"
          value={plantCode}
          onChange={e => setPlantCode(e.target.value)}
          required
        />
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
          <button type="button" className="cancel" onClick={clearForm}>
            Cancel
          </button>
        )}
      </form>

      <form onSubmit={handleSearch}>
        <input
          placeholder="Search by type"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit">Search</button>
        <button type="button" className="cancel" onClick={clearSearch}>
          Show All
        </button>
      </form>

      {message && <p role="status">{message}</p>}

      <h2>Plant Records</h2>
      <table>
        <thead>
          <tr>
            <th>Plant Code</th>
            <th>Name</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {plants.map(plant => (
            <tr key={plant._id}>
              <td>{plant.plantCode}</td>
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
