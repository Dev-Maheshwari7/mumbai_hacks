import { useState } from 'react';

export default function AIAgent() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('http://localhost:5000/fact-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url }),
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
      <h1>AI Fact Checker Agent</h1>

      <div style={{ marginBottom: '10px' }}>
        <label>
          Enter URL (Twitter, X, or Website):
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://x.com/... or https://example.com/..."
          style={{ width: '100%', padding: '8px', marginTop: '5px', marginBottom: '10px' }}
        />
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={loading}
        style={{ padding: '10px 20px', cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? 'Analyzing...' : 'Check Fact'}
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: '20px' }}>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {results && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
          <h2>Results</h2>

          {results.extracted_content && (
            <div style={{ marginBottom: '20px' }}>
              <h3>Extracted Content:</h3>
              <p style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f5f5f5', padding: '10px' }}>
                {results.extracted_content}
              </p>
            </div>
          )}

          {results.results && results.results.length > 0 && (
            <div>
              <h3>Fact-Check Analysis:</h3>
              {results.results.map((result, index) => (
                <div key={index} style={{ marginBottom: '15px', borderLeft: '3px solid #007bff', paddingLeft: '10px' }}>
                  <h4>Statement {index + 1}:</h4>
                  <p><strong>Text:</strong> {result.text}</p>
                  
                  {result.search_results && (
                    <div>
                      <strong>Search Results:</strong>
                      <p style={{ backgroundColor: '#f9f9f9', padding: '10px', marginTop: '5px', fontSize: '14px' }}>
                        {result.search_results}
                      </p>
                    </div>
                  )}

                  {result.analysis && (
                    <div>
                      <strong>AI Analysis:</strong>
                      <p style={{ backgroundColor: '#f0f8ff', padding: '10px', marginTop: '5px' }}>
                        {result.analysis}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
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