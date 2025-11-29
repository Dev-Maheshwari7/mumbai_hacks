import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Aiagent() {
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

  const getVerdictColor = (verdict) => {
    if (verdict === 'TRUE') return 'bg-green-50 border-l-4 border-green-500';
    if (verdict === 'FALSE') return 'bg-red-50 border-l-4 border-red-500';
    return 'bg-gray-50 border-l-4 border-gray-500';
  };

  const getVerdictBadge = (verdict) => {
    if (verdict === 'TRUE') return 'bg-green-100 text-green-800';
    if (verdict === 'FALSE') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-700';
    if (confidence >= 60) return 'text-yellow-700';
    return 'text-red-700';
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 flex flex-col">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="max-w-5xl mx-auto w-full px-4 py-8">
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
            <div className="mt-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Fact-Check Results</h2>

              {results.results && results.results.length > 0 ? (
                <div className="space-y-4">
                  {results.results.map((result, index) => (
                    <div key={index} className={`p-6 rounded-lg ${getVerdictColor(result.verdict)}`}>
                      {/* Claim */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1"><strong>Claim:</strong></p>
                        <p className="text-gray-800 text-base">{result.claim}</p>
                      </div>

                      {/* Verdict and Confidence */}
                      <div className="flex gap-4 mb-4 flex-wrap">
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getVerdictBadge(result.verdict)}`}>
                            {result.verdict}
                          </span>
                        </div>
                        <div>
                          <span className={`inline-block text-sm font-semibold ${getConfidenceColor(result.confidence)}`}>
                            Confidence: {result.confidence}%
                          </span>
                        </div>
                      </div>

                      {/* Sources */}
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Sources:</p>
                        <p className="text-sm text-gray-600 bg-white bg-opacity-50 px-3 py-2 rounded">
                          {result.sources || 'None'}
                        </p>
                      </div>

                      {/* Search Results Preview */}
                      {result.search_results && result.search_results.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-3">Supporting Evidence:</p>
                          <div className="space-y-3">
                            {result.search_results.map((sr) => (
                              <div key={sr.id} className="bg-white bg-opacity-70 p-4 rounded border border-gray-200">
                                <div className="flex items-start gap-3">
                                  <span className="font-bold text-indigo-700 text-lg min-w-fit">[{sr.id}]</span>
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-800 text-sm mb-2">{sr.title}</p>
                                    <p className="text-gray-700 text-sm mb-2">{sr.snippet}</p>
                                    {sr.link && (
                                      <a 
                                        href={sr.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-800 text-xs break-all"
                                      >
                                        🔗 {sr.link}
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Full Analysis */}
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
                          View Full Analysis
                        </summary>
                        <div className="mt-3 text-sm text-gray-700 bg-white bg-opacity-50 p-3 rounded whitespace-pre-wrap">
                          {result.analysis}
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">
                  <p>No results available</p>
                </div>
              )}

              {results.error && (
                <div className="text-red-600 bg-red-50 p-4 rounded-lg">
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