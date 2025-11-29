import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

// Add keyframe animation for spinner
const spinnerStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

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
    <>
      <style>{spinnerStyles}</style>
      <div style={styles.page}>
        <Navbar user={user} onLogout={handleLogout} />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Link Fact Checker</h1>
          <p style={styles.subtitle}>Verify claims from any URL with AI-powered analysis</p>
        </div>

        <div style={styles.mainCard}>
          <div style={styles.inputSection}>
            <div style={styles.iconWrapper}>
              <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>

            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article or https://x.com/post..."
              style={styles.input}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleSubmit()}
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={loading ? styles.buttonDisabled : styles.button}
            >
              {loading ? (
                <span style={styles.buttonContent}>
                  <span style={styles.spinner}></span>
                  Analyzing...
                </span>
              ) : (
                <span style={styles.buttonContent}>
                  <svg style={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verify Facts
                </span>
              )}
            </button>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          {results && (
            <div style={styles.resultsContainer}>
              {results.extracted_content && (
                <div style={styles.resultCard}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>Extracted Content</h3>
                  </div>
                  <div style={styles.contentBox}>
                    {results.extracted_content}
                  </div>
                </div>
              )}

              {results.results && results.results.length > 0 && (
                <div style={styles.resultCard}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>Fact-Check Analysis</h3>
                  </div>
                  {results.results.map((result, index) => (
                    <div key={index} style={styles.analysisItem}>
                      <div style={styles.statementBadge}>Statement {index + 1}</div>
                      <div style={styles.statementText}>
                        <strong style={styles.statementLabel}>Claim:</strong>
                        <p style={styles.statementContent}>{result.text}</p>
                      </div>

                      {result.search_results && (
                        <div style={styles.evidenceSection}>
                          <div style={styles.evidenceHeader}>
                            <strong>Search Evidence</strong>
                          </div>
                          <div style={styles.searchBox}>
                            {typeof result.search_results === 'string' 
                              ? result.search_results 
                              : Array.isArray(result.search_results)
                                ? result.search_results.map((item, idx) => (
                                    <div key={idx} style={styles.searchResult}>
                                      <div style={styles.searchTitle}>{item.title}</div>
                                      <div style={styles.searchSnippet}>{item.snippet}</div>
                                      <a href={item.link} target="_blank" rel="noopener noreferrer" 
                                         style={styles.searchLink}>
                                        View Source →
                                      </a>
                                    </div>
                                  ))
                                : JSON.stringify(result.search_results)
                            }
                          </div>
                        </div>
                      )}

                      {result.analysis && (
                        <div style={styles.aiSection}>
                          <div style={styles.aiHeader}>
                            <strong>AI Analysis</strong>
                          </div>
                          <div style={styles.analysisBox}>{result.analysis}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {results.error && (
                <div style={styles.errorBox}>
                  <p style={styles.errorText}>Error: {results.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#f9fafb',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  container: {
    flex: 1,
    marginLeft: '288px',
    padding: '40px',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#6b7280',
    fontWeight: '400',
  },
  mainCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
  },
  inputSection: {
    marginBottom: '24px',
  },
  iconWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
    marginBottom: '20px',
  },
  icon: {
    width: '24px',
    height: '24px',
    color: 'white',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    color: '#1f2937',
    backgroundColor: 'white',
    transition: 'all 0.2s ease',
    outline: 'none',
    marginBottom: '16px',
    fontFamily: 'inherit',
  },
  button: {
    width: '100%',
    padding: '14px 20px',
    fontSize: '15px',
    fontWeight: '600',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    background: '#9333ea',
    color: 'white',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    letterSpacing: '0.3px',
  },
  buttonDisabled: {
    width: '100%',
    padding: '14px 20px',
    fontSize: '15px',
    fontWeight: '600',
    borderRadius: '10px',
    border: 'none',
    cursor: 'not-allowed',
    background: '#d1d5db',
    color: 'white',
    boxShadow: 'none',
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  buttonIcon: {
    width: '20px',
    height: '20px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
  },
  errorBox: {
    marginTop: '16px',
    padding: '14px 16px',
    borderRadius: '10px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
  },
  errorText: {
    margin: 0,
    fontSize: '14px',
    color: '#dc2626',
    fontWeight: '500',
  },
  resultsContainer: {
    marginTop: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  resultCard: {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e5e7eb',
  },
  cardHeader: {
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e5e7eb',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0,
    letterSpacing: '-0.3px',
  },
  contentBox: {
    background: 'white',
    borderRadius: '10px',
    padding: '16px',
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#374151',
    border: '1px solid #e5e7eb',
    whiteSpace: 'pre-wrap',
    fontWeight: '400',
  },
  analysisItem: {
    marginBottom: '20px',
    padding: '20px',
    borderRadius: '12px',
    background: 'white',
    border: '1px solid #e5e7eb',
  },
  statementBadge: {
    display: 'inline-block',
    backgroundColor: '#9333ea',
    borderRadius: '6px',
    padding: '6px 12px',
    marginBottom: '16px',
    fontWeight: '600',
    fontSize: '13px',
    color: 'white',
  },
  statementText: {
    marginBottom: '16px',
  },
  statementLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statementContent: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#1f2937',
    marginTop: '8px',
    fontWeight: '500',
  },
  evidenceSection: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb',
  },
  evidenceHeader: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '12px',
  },
  searchBox: {
    padding: '0',
  },
  searchResult: {
    marginBottom: '16px',
    padding: '14px',
    borderRadius: '8px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
  },
  searchTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '6px',
  },
  searchSnippet: {
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: '1.5',
    marginBottom: '8px',
  },
  searchLink: {
    fontSize: '12px',
    color: '#9333ea',
    textDecoration: 'none',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  aiSection: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb',
  },
  aiHeader: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '12px',
  },
  analysisBox: {
    padding: '14px',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#166534',
    lineHeight: '1.6',
  },
};