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

  return (
    <div style={{ 
      marginLeft: '288px',
      padding: '40px',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: "'Inter', 'Segoe UI', sans-serif"
    }}>
      <motion.div
        style={{ marginBottom: '32px' }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          color: '#1f2937',
          marginBottom: '8px',
          letterSpacing: '-0.5px'
        }}>
          Trending Misinformation
        </h1>
        <p style={{ 
          fontSize: '14px', 
          color: '#6b7280',
          fontWeight: '400'
        }}>
          Discover what's spreading misinformation across different topics and regions
        </p>
      </motion.div>

      <motion.div 
        style={{ 
          backgroundColor: 'white', 
          borderRadius: '16px', 
          padding: '32px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '24px',
          border: '1px solid #e5e7eb'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div>
            <label style={{ 
              fontWeight: '600', 
              marginBottom: '8px', 
              display: 'block', 
              fontSize: '13px', 
              color: '#374151',
              letterSpacing: '0.3px'
            }}>
              Select Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                borderRadius: '8px', 
                border: '1px solid #d1d5db', 
                fontSize: '14px', 
                color: '#1f2937',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
                fontWeight: '500'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#9333ea';
                e.target.style.boxShadow = '0 0 0 3px rgba(147, 51, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">-- Choose a topic --</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ 
              fontWeight: '600', 
              marginBottom: '8px', 
              display: 'block', 
              fontSize: '13px', 
              color: '#374151',
              letterSpacing: '0.3px'
            }}>
              Select Location
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                borderRadius: '8px', 
                border: '1px solid #d1d5db', 
                fontSize: '14px', 
                color: '#1f2937',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
                fontWeight: '500'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#9333ea';
                e.target.style.boxShadow = '0 0 0 3px rgba(147, 51, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">-- Choose a location --</option>
              {areas.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        </div>

        <motion.button
          onClick={handleSubmit}
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          style={{ 
            marginTop: '8px', 
            width: '100%', 
            padding: '12px 20px', 
            fontSize: '14px', 
            fontWeight: '600', 
            borderRadius: '8px', 
            border: 'none', 
            cursor: loading ? 'not-allowed' : 'pointer', 
            background: loading ? '#d1d5db' : '#9333ea',
            color: 'white', 
            transition: 'all 0.2s ease',
            boxShadow: loading ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.05)',
            letterSpacing: '0.3px'
          }}
          onMouseEnter={(e) => {
            if (!loading) e.target.style.background = '#7e22ce';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.target.style.background = '#9333ea';
          }}
        >
          {loading ? 'Fetching Data...' : 'Get Trending Misinformation'}
        </motion.button>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              color: '#dc2626', 
              marginTop: '16px', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {error}
          </motion.div>
        )}
      </motion.div>

      {results && (
        <motion.div 
          style={{ 
            backgroundColor: 'white', 
            borderRadius: '16px', 
            padding: '32px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div style={{ 
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '2px solid #e5e7eb'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#1f2937',
              marginBottom: '6px',
              letterSpacing: '-0.3px'
            }}>
              Top Misinformation
            </h2>
            <p style={{ 
              fontSize: '13px', 
              color: '#6b7280',
              fontWeight: '500'
            }}>
              {selectedTopic} • {selectedArea}
            </p>
          </div>

          {results.misinformation && results.misinformation.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {results.misinformation.map((item, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ 
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  style={{ 
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px', 
                    padding: '20px',
                    border: '1px solid #e5e7eb',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    backgroundColor: index % 3 === 0 ? '#9333ea' : index % 3 === 1 ? '#a855f7' : '#c084fc',
                    borderTopLeftRadius: '12px',
                    borderBottomLeftRadius: '12px'
                  }}></div>
                  
                  <div style={{ 
                    display: 'inline-block',
                    backgroundColor: '#9333ea',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    marginBottom: '12px',
                    fontWeight: '600',
                    fontSize: '13px',
                    color: 'white'
                  }}>
                    #{index + 1}
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ 
                      fontSize: '11px', 
                      fontWeight: '600', 
                      color: '#9ca3af',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '6px'
                    }}>
                      Misinformation Claim
                    </p>
                    <p style={{ 
                      fontSize: '14px', 
                      lineHeight: '1.6', 
                      color: '#374151',
                      fontWeight: '500',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}>
                      {item.misinformation}
                    </p>
                  </div>
                  
                  <div>
                    <p style={{ 
                      fontSize: '11px', 
                      fontWeight: '600', 
                      color: '#9ca3af',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '6px'
                    }}>
                      Source
                    </p>
                    <p style={{ 
                      fontSize: '13px', 
                      color: '#6b7280',
                      fontWeight: '500',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}>
                      {item.source}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#9ca3af',
              fontSize: '14px'
            }}>
              <p style={{ fontWeight: '500' }}>No misinformation data available</p>
            </div>
          )}

          {results.error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ 
                color: '#dc2626', 
                marginTop: '16px',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              Error: {results.error}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}