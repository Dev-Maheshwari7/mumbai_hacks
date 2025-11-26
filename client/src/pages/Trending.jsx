import { useState } from 'react';

export default function Trending() {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const topics = [
    'Finance',
    'Healthcare',
    'Sports',
    'Entertainment',
    'Politics',
    'Technology',
    'Science',
    'Education'
  ];

  const areas = [
    'Mumbai',
    'Delhi',
    'Hyderabad',
    'Bangalore',
    'Kolkata',
    'India',
    'USA',
    'UK',
    'Canada',
    'Australia'
  ];

  const handleSubmit = async () => {
    if (!selectedTopic || !selectedArea) {
      setError('Please select both topic and area');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('http://localhost:5000/trending-misinformation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: selectedTopic,
          area: selectedArea
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from backend');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Trending Misinformation</h1>

      <div style={{ marginBottom: '20px' }}>
        <label>
          <div>Select Topic:</div>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px', marginBottom: '15px' }}
          >
            <option value="">-- Choose a topic --</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </label>

        <label>
          <div>Select City or Country:</div>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="">-- Choose an area --</option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ padding: '10px 20px', cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? 'Fetching...' : 'Get Trending Misinformation'}
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: '20px' }}>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {results && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
          <h2>Top Misinformation in {selectedTopic} - {selectedArea}</h2>

          {results.misinformation && results.misinformation.length > 0 ? (
            <div>
              {results.misinformation.map((item, index) => (
                <div key={index} style={{ marginBottom: '15px', borderLeft: '3px solid #ff6b6b', paddingLeft: '10px' }}>
                  <h4>#{index + 1}</h4>
                  <p><strong>Misinformation:</strong> {item.misinformation}</p>
                  <p><strong>Source:</strong> {item.source}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No misinformation data received</p>
          )}

          {results.error && (
            <div style={{ color: 'red' }}>
              <p>Error: {results.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}