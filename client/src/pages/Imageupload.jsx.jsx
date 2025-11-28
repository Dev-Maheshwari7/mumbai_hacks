import { useState } from 'react';
import { Upload, Loader, AlertCircle } from 'lucide-react';

export default function Imageupload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
      setError(null);
    } else {
      setError('Please select a valid image file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('http://localhost:5000/api/analyze-image', {
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
      setError(err.message || 'Failed to process image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Image Analyzer</h1>
          <p className="text-gray-600 mb-8">Upload an image to analyze with Gemini AI</p>

          {/* Upload Section */}
          <div className="border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center hover:border-indigo-500 transition">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="fileInput"
            />
            <label htmlFor="fileInput" className="cursor-pointer">
              <Upload className="mx-auto mb-3 text-indigo-500" size={40} />
              <p className="text-lg font-semibold text-gray-700">
                {selectedFile ? selectedFile.name : 'Click to upload image'}
              </p>
              <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF, WebP</p>
            </label>
          </div>

          {/* Preview */}
          {preview && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 mx-auto rounded-lg shadow-md"
              />
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
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Image'
            )}
          </button>

          {/* Results */}
          {result && (
            <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Analysis Results</h2>
              
              {result.analysis && (
                <div className="bg-white rounded p-4 text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {result.analysis}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}