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
          headers: { "Authorization": `Bearer ${token}` },
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
    <div style={styles.page}>
      <Navbar user={user} onLogout={handleLogout} />
<<<<<<< Updated upstream
      <div className="max-w-5xl mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">AI Fact Checker Agent</h1>
=======
      <div style={styles.container}>
        {/* Background card like template */}
        <div style={styles.backgroundCard}>
          {/* Blobby shapes */}
          <div style={{ ...styles.blob, ...styles.blob1 }} />
          <div style={{ ...styles.blob, ...styles.blob2 }} />
          <div style={{ ...styles.blob, ...styles.blob3 }} />
          <div style={{ ...styles.blob, ...styles.blob4 }} />
>>>>>>> Stashed changes

          {/* Small pills / waves */}
          <div style={{ ...styles.pill, ...styles.pill1 }} />
          <div style={{ ...styles.pill, ...styles.pill2 }} />
          <div style={{ ...styles.pill, ...styles.pill3 }} />

          {/* Center card with checker (no backend or inputs changed) */}
          <div style={styles.centerCard}>
            <h1 style={styles.title}>AI Fact Checker</h1>
            <p style={styles.subtitle}>Paste a URL to verify claims with AI</p>

            <div style={styles.formGroup}>
              <label style={styles.label}>Enter URL</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://x.com/... or https://example.com/..."
                style={styles.input}
              />
            </div>

<<<<<<< Updated upstream
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
=======
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {})
              }}
            >
              {loading ? 'Analyzing...' : 'Check Fact'}
            </button>

            {error && (
              <div style={styles.errorBox}>
                <p style={styles.errorText}>{error}</p>
              </div>
            )}

            {results && (
              <div style={styles.resultsContainer}>
                {results.extracted_content && (
                  <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Extracted Content</h3>
                    <div style={styles.contentBox}>
                      {results.extracted_content}
                    </div>
                  </div>
                )}

                {results.results && results.results.length > 0 && (
                  <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Fact-Check Analysis</h3>
                    {results.results.map((result, index) => (
                      <div key={index} style={styles.resultItem}>
                        <h4 style={styles.resultHeader}>Statement {index + 1}</h4>
                        <div style={styles.resultText}>
                          <strong>Text:</strong> {result.text}
                        </div>

                        {result.search_results && (
                          <div style={styles.resultSection}>
                            <strong>Search Results:</strong>
                            <div style={styles.searchBox}>{result.search_results}</div>
                          </div>
                        )}

                        {result.analysis && (
                          <div style={styles.resultSection}>
                            <strong>AI Analysis:</strong>
                            <div style={styles.analysisBox}>{result.analysis}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {results.error && (
                  <div style={styles.section}>
                    <p style={styles.errorText}>Error: {results.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
>>>>>>> Stashed changes
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 40%, #0ea5e9 100%)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  container: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'right',
    padding: '24px',
  },
  backgroundCard: {
    position: 'relative',
    width: '100%',
    maxWidth: '1100px',
    aspectRatio: '16 / 7',
    background: 'radial-gradient(circle at top left, #38bdf8 0%, #1d4ed8 45%, #0f172a 100%)',
    borderRadius: '32px',
    overflow: 'hidden',
    boxShadow: '0 30px 80px rgba(15, 23, 42, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
    background: 'rgba(15, 23, 42, 0.18)',
    borderRadius: '40% 60% 60% 40%',
    filter: 'blur(2px)',
  },
  blob1: {
    width: '260px',
    height: '260px',
    top: '-40px',
    left: '-60px',
  },
  blob2: {
    width: '220px',
    height: '220px',
    bottom: '-60px',
    left: '40px',
  },
  blob3: {
    width: '260px',
    height: '260px',
    top: '-80px',
    right: '-40px',
  },
  blob4: {
    width: '220px',
    height: '220px',
    bottom: '-40px',
    right: '60px',
  },
  pill: {
    position: 'absolute',
    borderRadius: '999px',
    background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
  },
  pill1: {
    width: '90px',
    height: '28px',
    top: '20%',
    left: '25%',
  },
  pill2: {
    width: '70px',
    height: '24px',
    top: '65%',
    left: '18%',
  },
  pill3: {
    width: '110px',
    height: '30px',
    bottom: '18%',
    right: '22%',
  },
  centerCard: {
    position: 'relative',
    zIndex: 5,
    width: '100%',
    maxWidth: '520px',
    padding: '32px 36px',
    borderRadius: '24px',
    background: 'transparent',
    backdropFilter: 'blur(5px)',
    border: '1px solid rgba(148, 163, 184, 0.4)',
    boxShadow: '0 20px 60px rgba(15, 23, 42, 0.7)',
    color: 'white',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#e5e7eb',
    marginBottom: '24px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    marginBottom: '8px',
    color: '#cbd5f5',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #1d4ed8',
    background: 'rgba(15,23,42,0.9)',
    color: '#e5e7eb',
    fontSize: '14px',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(90deg, #38bdf8, #1d4ed8)',
    color: 'white',
    fontWeight: 600,
    fontSize: '15px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  errorBox: {
    marginBottom: '16px',
    padding: '10px 12px',
    borderRadius: '10px',
    background: 'rgba(248, 113, 113, 0.15)',
    border: '1px solid rgba(248, 113, 113, 0.5)',
  },
  errorText: {
    margin: 0,
    fontSize: '13px',
    color: '#fecaca',
  },
  resultsContainer: {
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid rgba(148, 163, 184, 0.5)',
    maxHeight: '260px',
    overflowY: 'auto',
  },
  section: {
    marginBottom: '18px',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: 600,
    marginBottom: '8px',
    color: '#e5e7eb',
  },
  contentBox: {
    background: 'rgba(15, 23, 42, 0.9)',
    borderRadius: '10px',
    padding: '10px 12px',
    fontSize: '13px',
    lineHeight: 1.5,
    border: '1px solid rgba(148, 163, 184, 0.5)',
    whiteSpace: 'pre-wrap',
  },
  resultItem: {
    marginBottom: '14px',
    padding: '10px 12px',
    borderRadius: '10px',
    background: 'rgba(15, 23, 42, 0.9)',
    border: '1px solid rgba(96, 165, 250, 0.6)',
  },
  resultHeader: {
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '6px',
  },
  resultText: {
    fontSize: '13px',
    color: '#e5e7eb',
    marginBottom: '6px',
  },
  resultSection: {
    marginTop: '4px',
  },
  searchBox: {
    marginTop: '4px',
    padding: '8px',
    borderRadius: '8px',
    fontSize: '12px',
    background: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid rgba(56, 189, 248, 0.6)',
  },
  analysisBox: {
    marginTop: '4px',
    padding: '8px',
    borderRadius: '8px',
    fontSize: '12px',
    background: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid rgba(129, 140, 248, 0.7)',
  },
};