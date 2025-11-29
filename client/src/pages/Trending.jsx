import { useState } from 'react';
import { motion } from "framer-motion";

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

  const gradientButton = {
    background: 'linear-gradient(90deg, #ff6b6b, #f06595)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    padding: '14px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: loading ? 'not-allowed' : 'pointer',
    boxShadow: '0 8px 20px rgba(255,107,107,0.4)',
    transition: 'transform 0.2s ease-in-out',
  };
  return (
    <div style={{ padding: '50px', maxWidth: '700px', margin: '0 auto', fontFamily: 'Helvetica, Arial, sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <motion.h1
        style={{ fontSize: '34px', fontWeight: '600', textAlign: 'center', marginBottom: '40px', color: '#222' }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Trending Misinformation
      </motion.h1>


      <motion.div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 6px 18px rgba(0,0,0,0.05)', marginBottom: '30px' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontWeight: '500', marginBottom: '5px', display: 'block', fontSize: '15px', color: '#555' }}>Select Topic</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', color: '#333' }}
            >
              <option value="">-- Choose a topic --</option>
              {topics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
            </select>
          </div>


          <div>
            <label style={{ fontWeight: '500', marginBottom: '5px', display: 'block', fontSize: '15px', color: '#555' }}>Select City or Country</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', color: '#333' }}
            >
              <option value="">-- Choose an area --</option>
              {areas.map((area) => <option key={area} value={area}>{area}</option>)}
            </select>
          </div>
        </div>


        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ marginTop: '25px', width: '100%', padding: '12px', fontSize: '15px', fontWeight: '500', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', backgroundColor: '#222', color: 'white', transition: 'background-color 0.2s ease' }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#444'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#222'}
        >
          {loading ? 'Fetching...' : 'Get Trending Misinformation'}
        </button>


        {error && (
          <div style={{ color: 'red', marginTop: '20px', padding: '12px', borderRadius: '8px', backgroundColor: '#ffe5e5', border: '1px solid #f5c6cb' }}>
            <p>{error}</p>
          </div>
        )}
      </motion.div>


      {results && (
        <motion.div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 6px 18px rgba(0,0,0,0.05)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 style={{ fontSize: '22px', fontWeight: '500', marginBottom: '20px', color: '#222' }}>
            Top Misinformation in {selectedTopic} - {selectedArea}
          </h2>


          {results.misinformation && results.misinformation.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {results.misinformation.map((item, index) => (
                <div key={index} style={{ borderLeft: '3px solid #222', paddingLeft: '12px', borderRadius: '6px', backgroundColor: '#fafafa', padding: '10px' }}>
                  <h4 style={{ fontWeight: '500', marginBottom: '5px' }}>#{index + 1}</h4>
                  <p><strong>Misinformation:</strong> {item.misinformation}</p>
                  <p><strong>Source:</strong> {item.source}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#777' }}>No misinformation data received</p>
          )}


          {results.error && (
            <div style={{ color: 'red', marginTop: '15px' }}>Error: {results.error}</div>
          )}
        </motion.div>
      )}
    </div>
  );
}