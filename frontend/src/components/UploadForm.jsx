import { useState } from 'react'

function UploadForm({ onUpload }) {
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [options, setOptions] = useState({
    tone: 'professional',
    verbosity: 'standard',
    language: 'en',
    fetchImages: true,
    customInstructions: ''
  })
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (file) {
      onUpload(file, options)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed p-8 transition-colors duration-200 ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
        />

        {!file ? (
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center cursor-pointer"
          >
            <svg
              className="w-12 h-12 text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-gray-700 font-medium mb-1">
              Upload your event content
            </span>
            <span className="text-gray-500 text-sm">
              PDF, Word, PowerPoint, or text files with event details
            </span>
          </label>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg
                className="w-10 h-10 text-primary-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div>
                <p className="text-gray-900 font-medium">{file.name}</p>
                <p className="text-gray-500 text-sm">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Advanced Options Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
      >
        <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
        <svg
          className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tone
              </label>
              <select
                value={options.tone}
                onChange={(e) => setOptions({ ...options, tone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="funny">Funny</option>
                <option value="educational">Educational</option>
                <option value="sales_pitch">Sales Pitch</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verbosity
              </label>
              <select
                value={options.verbosity}
                onChange={(e) => setOptions({ ...options, verbosity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="concise">Concise</option>
                <option value="standard">Standard</option>
                <option value="text-heavy">Text Heavy</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.fetchImages}
                onChange={(e) => setOptions({ ...options, fetchImages: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Include event imagery</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Details (Optional)
            </label>
            <textarea
              value={options.customInstructions}
              onChange={(e) => setOptions({ ...options, customInstructions: e.target.value })}
              placeholder="Add specific event details, location, date/time, or special instructions..."
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows="3"
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!file}
        className={`w-full py-3 px-6 font-medium transition-all duration-200 ${
          file
            ? 'bg-primary-600 hover:bg-primary-700 text-white'
            : 'bg-[#f1f4f7] text-gray-500 cursor-not-allowed'
        }`}
        style={{backgroundColor: !file ? '#f1f4f7' : undefined}}
      >
        Generate Screen Starting Points
      </button>
    </form>
  )
}

export default UploadForm
