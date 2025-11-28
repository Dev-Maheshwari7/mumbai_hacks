import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function AIAgent() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

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
    <div className="w-full min-h-screen bg-gray-100 flex flex-col">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="max-w-4xl mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">AI Fact Checker Agent</h1>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Enter URL (Twitter, X, or Website):
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://x.com/... or https://example.com/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {loading ? 'Analyzing...' : 'Check Fact'}
          </button>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-red-800 font-semibold mb-2">Error:</h3>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {results && (
            <div className="mt-6 border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Results</h2>

              {results.extracted_content && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Extracted Content:</h3>
                  <p className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-gray-700">
                    {results.extracted_content}
                  </p>
                </div>
              )}

              {results.results && results.results.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">Fact-Check Analysis:</h3>
                  {results.results.map((result, index) => (
                    <div key={index} className="mb-6 border-l-4 border-indigo-500 pl-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Statement {index + 1}:</h4>
                      <p className="mb-3"><strong className="text-gray-700">Text:</strong> <span className="text-gray-600">{result.text}</span></p>
                      
                      {result.search_results && (
                        <div className="mb-3">
                          <strong className="text-gray-700">Search Results:</strong>
                          <p className="bg-gray-50 p-3 mt-2 rounded-lg text-sm text-gray-600">
                            {result.search_results}
                          </p>
                        </div>
                      )}

                      {result.analysis && (
                        <div>
                          <strong className="text-gray-700">AI Analysis:</strong>
                          <p className="bg-blue-50 p-3 mt-2 rounded-lg text-gray-700">
                            {result.analysis}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {results.error && (
                <div className="text-red-600">
                  <p>Error: {results.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}