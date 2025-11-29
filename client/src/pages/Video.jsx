import { useState } from 'react';
import { Upload, Loader, AlertCircle, CheckCircle, Play } from 'lucide-react';

export default function VideoAnalyzer() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      // Check file size (20MB limit)
      if (file.size > 20 * 1024 * 1024) {
        setError('File too large. Maximum size is 20MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
      setError(null);
    } else {
      setError('Please select a valid video file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a video first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);

      const response = await fetch('http://localhost:5000/api/analyze-video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      setSelectedFile(null);
      setPreview(null);
    } catch (err) {
      setError(err.message || 'Failed to process video');
    } finally {
      setLoading(false);
    }
  };

  const parseAnalysis = (text) => {
    if (!text) return null;

    const lines = text.split('\n').map(line => line.replace(/\\/g, '').replace(/\*/g, '').trim());
    let confidence = null;
    let verdict = null;
    let details = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (!line) continue;

      // Check for confidence score (look for % or numbers)
      if (!confidence && (line.match(/confidence/i) || line.match(/score/i))) {
        // Get this line and potentially the next line if it just has the number
        if (line.match(/%|\d+/)) {
          confidence = line;
        } else if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          confidence = nextLine;
        }
        continue;
      }

      // Check for verdict - look for statements about AI vs real
      if (!verdict && (line.includes('AI-generated') || line.includes('Real') || line.includes('artificial') || line.includes('genuine') || (line.match(/likely/i) && line.length > 10))) {
        verdict = line;
        continue;
      }

      // Add to details if it's meaningful
      // Skip pure headers, numbering, and single words
      if (line.length > 15 && !line.match(/^[0-9]+\.$/) && line.split(' ').length > 2) {
        details.push(line);
      }
    }

    return { confidence, verdict, details };
  };

  const parsed = result ? parseAnalysis(result.analysis) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Video AI Detector</h1>
          <p className="text-gray-600 mb-8">Upload a video to detect if it's AI-generated or real</p>

          {/* Upload Section */}
          <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center hover:border-purple-500 transition">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
              id="videoInput"
            />
            <label htmlFor="videoInput" className="cursor-pointer">
              <Upload className="mx-auto mb-3 text-purple-500" size={40} />
              <p className="text-lg font-semibold text-gray-700">
                {selectedFile ? selectedFile.name : 'Click to upload video'}
              </p>
              <p className="text-sm text-gray-500 mt-1">MP4, WebM, AVI (Max 20MB)</p>
            </label>
          </div>

          {/* Preview */}
          {preview && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
              <video
                src={preview}
                controls
                className="max-h-64 mx-auto rounded-lg shadow-md w-full"
              />
            </div>
          )}

          {/* File Size Info */}
          {selectedFile && (
            <div className="mt-4 text-sm text-gray-600">
              File size: {(selectedFile.size / 1024 / 1024).toFixed(2)}MB
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin" />
                Analyzing Video...
              </>
            ) : (
              <>
                <Play size={20} />
                Analyze Video
              </>
            )}
          </button>

          {/* Results */}
          {result && parsed && (
            <div className="mt-8 space-y-6">
              {/* Verdict Card */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-purple-600 flex-shrink-0 mt-0.5" size={24} />
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Detection Result</h2>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {parsed.verdict || 'Analysis complete'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Confidence Score */}
              {parsed.confidence && (
                <div className="bg-white border border-purple-100 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Confidence Score</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {parsed.confidence}
                  </p>
                </div>
              )}

              {/* Details */}
              {parsed.details.length > 0 && (
                <div className="bg-white border border-purple-100 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Analysis Details</h3>
                  <div className="space-y-3">
                    {parsed.details.map((detail, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 leading-relaxed">{detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}import { useState } from 'react';
import { Upload, Loader, AlertCircle, CheckCircle, Play } from 'lucide-react';

export default function VideoAnalyzer() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      // Check file size (20MB limit)
      if (file.size > 20 * 1024 * 1024) {
        setError('File too large. Maximum size is 20MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
      setError(null);
    } else {
      setError('Please select a valid video file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a video first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);

      const response = await fetch('http://localhost:5000/api/analyze-video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      setSelectedFile(null);
      setPreview(null);
    } catch (err) {
      setError(err.message || 'Failed to process video');
    } finally {
      setLoading(false);
    }
  };

  const parseAnalysis = (text) => {
    if (!text) return null;

    const lines = text.split('\n').map(line => line.replace(/\*\*/g, '').replace(/\*/g, '').trim());
    let confidence = null;
    let verdict = null;
    let details = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (!line) continue;

      // Check for confidence score (look for % or numbers)
      if (!confidence && (line.match(/confidence/i) || line.match(/score/i))) {
        // Get this line and potentially the next line if it just has the number
        if (line.match(/%|\d+/)) {
          confidence = line;
        } else if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          confidence = nextLine;
        }
        continue;
      }

      // Check for verdict - look for statements about AI vs real
      if (!verdict && (line.includes('AI-generated') || line.includes('Real') || line.includes('artificial') || line.includes('genuine') || (line.match(/likely/i) && line.length > 10))) {
        verdict = line;
        continue;
      }

      // Add to details if it's meaningful
      // Skip pure headers, numbering, and single words
      if (line.length > 15 && !line.match(/^[0-9]+\.$/) && line.split(' ').length > 2) {
        details.push(line);
      }
    }

    return { confidence, verdict, details };
  };

  const parsed = result ? parseAnalysis(result.analysis) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Video AI Detector</h1>
          <p className="text-gray-600 mb-8">Upload a video to detect if it's AI-generated or real</p>

          {/* Upload Section */}
          <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center hover:border-purple-500 transition">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
              id="videoInput"
            />
            <label htmlFor="videoInput" className="cursor-pointer">
              <Upload className="mx-auto mb-3 text-purple-500" size={40} />
              <p className="text-lg font-semibold text-gray-700">
                {selectedFile ? selectedFile.name : 'Click to upload video'}
              </p>
              <p className="text-sm text-gray-500 mt-1">MP4, WebM, AVI (Max 20MB)</p>
            </label>
          </div>

          {/* Preview */}
          {preview && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
              <video
                src={preview}
                controls
                className="max-h-64 mx-auto rounded-lg shadow-md w-full"
              />
            </div>
          )}

          {/* File Size Info */}
          {selectedFile && (
            <div className="mt-4 text-sm text-gray-600">
              File size: {(selectedFile.size / 1024 / 1024).toFixed(2)}MB
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin" />
                Analyzing Video...
              </>
            ) : (
              <>
                <Play size={20} />
                Analyze Video
              </>
            )}
          </button>

          {/* Results */}
          {result && parsed && (
            <div className="mt-8 space-y-6">
              {/* Verdict Card */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-purple-600 flex-shrink-0 mt-0.5" size={24} />
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Detection Result</h2>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {parsed.verdict || 'Analysis complete'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Confidence Score */}
              {parsed.confidence && (
                <div className="bg-white border border-purple-100 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Confidence Score</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {parsed.confidence}
                  </p>
                </div>
              )}

              {/* Details */}
              {parsed.details.length > 0 && (
                <div className="bg-white border border-purple-100 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Analysis Details</h3>
                  <div className="space-y-3">
                    {parsed.details.map((detail, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 leading-relaxed">{detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}