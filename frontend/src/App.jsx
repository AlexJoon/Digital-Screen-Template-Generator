import { useState } from 'react'
import axios from 'axios'
import UploadForm from './components/UploadForm'
import StatusDisplay from './components/StatusDisplay'
import SlidePreview from './components/SlidePreview'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

function App() {
  const [status, setStatus] = useState('idle') // idle, processing, review, generating, success, error
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(0)
  const [metadataSummary, setMetadataSummary] = useState(null)
  const [uploadOptions, setUploadOptions] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState('template1')
  const [selectedFormat, setSelectedFormat] = useState('pptx')
  const [exportedFile, setExportedFile] = useState(null)
  const [hiveSubmission, setHiveSubmission] = useState(null) // { submitting, success, actionUrl, error }

  const handleFormSubmit = async (options) => {
    try {
      setStatus('processing')
      setMessage('Analyzing your slide information...')
      setProgress(0)
      setMetadataSummary(null)
      setUploadOptions(options)
      setExportedFile(null)

      // Gradually increase progress to 50%
      const processingInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 2, 50))
      }, 100)

      const formData = new FormData()

      // Append metadata fields
      if (options.metadata) {
        if (options.metadata.slideCategory) formData.append('slide_category', options.metadata.slideCategory)
        if (options.metadata.headline) formData.append('headline', options.metadata.headline)
        if (options.metadata.caption) formData.append('caption', options.metadata.caption)
        if (options.metadata.description) formData.append('description', options.metadata.description)
        if (options.metadata.authorName) formData.append('author_name', options.metadata.authorName)
        if (options.metadata.publicationLink) formData.append('publication_link', options.metadata.publicationLink)
        if (options.metadata.image) {
          formData.append('image', options.metadata.image)
        }
      }

      setMessage('Processing image and metadata...')

      // Step 1: Process metadata and analyze image
      const metadataResponse = await axios.post(
        `${API_BASE_URL}/process-metadata`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 180000,
        }
      )

      clearInterval(processingInterval)
      setProgress(70)

      // Final progress to 100%
      const finalInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(finalInterval)
            return 100
          }
          return prev + 3
        })
      }, 50)

      // Show metadata summary for review
      setMetadataSummary(metadataResponse.data.metadata_summary)

      // Store full metadata including session_id for later use
      if (metadataResponse.data.metadata) {
        setUploadOptions(prev => ({
          ...prev,
          metadata: {
            ...prev.metadata,
            ...metadataResponse.data.metadata
          }
        }))
      }

      setStatus('review')
      await new Promise(resolve => setTimeout(resolve, 500))
      clearInterval(finalInterval)
      setProgress(100)
      setMessage('Ready to generate your slide')

    } catch (error) {
      console.error('Upload error:', error)
      setStatus('error')
      setProgress(0)

      if (error.response) {
        setMessage(`Error: ${error.response.data.detail || error.response.statusText}`)
      } else if (error.request) {
        setMessage('Network error. Please check your connection and try again.')
      } else {
        setMessage(`Error: ${error.message}`)
      }
    }
  }

  const handleExport = async (format) => {
    try {
      setStatus('generating')
      setMessage(`Creating your ${format.toUpperCase()} file...`)
      setProgress(0)

      // Gradually increase progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90))
      }, 100)

      // Build request body
      const requestBody = {
        headline: uploadOptions.metadata.headline,
        description: uploadOptions.metadata.description,
        caption: uploadOptions.metadata.caption || null,
        author_name: uploadOptions.metadata.authorName || uploadOptions.metadata.author_name || null,
        publication_link: uploadOptions.metadata.publicationLink || uploadOptions.metadata.publication_link || null,
        image_description: uploadOptions.metadata.image_description || null,
        template_id: selectedTemplate,
        session_id: uploadOptions.metadata.session_id || null
      }

      // Export to selected format
      const response = await axios.post(
        `${API_BASE_URL}/export?format=${format}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          responseType: 'blob',
          timeout: 60000,
        }
      )

      clearInterval(progressInterval)
      setProgress(100)

      // Create blob URL for download
      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const url = window.URL.createObjectURL(blob)

      // Get filename from header or generate one
      const contentDisposition = response.headers['content-disposition']
      let filename = `slide.${format}`
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/)
        if (match) filename = match[1]
      }

      setExportedFile({ url, filename, format })
      setStatus('success')
      setMessage(`Your ${format.toUpperCase()} is ready to download below!`)

    } catch (error) {
      console.error('Export error:', error)
      setStatus('error')
      setProgress(0)

      if (error.response) {
        setMessage(`Error: ${error.response.data?.detail || error.response.statusText}`)
      } else if (error.request) {
        setMessage('Network error. Please check your connection and try again.')
      } else {
        setMessage(`Error: ${error.message}`)
      }
    }
  }

  const handleDownload = () => {
    if (exportedFile) {
      const link = document.createElement('a')
      link.href = exportedFile.url
      link.download = exportedFile.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleReset = () => {
    // Clean up blob URL if exists
    if (exportedFile?.url) {
      window.URL.revokeObjectURL(exportedFile.url)
    }
    setStatus('idle')
    setMessage('')
    setProgress(0)
    setMetadataSummary(null)
    setUploadOptions(null)
    setSelectedTemplate('template1')
    setSelectedFormat('pptx')
    setExportedFile(null)
    setHiveSubmission(null)
  }

  const handleSubmitToHive = async () => {
    try {
      setHiveSubmission({ submitting: true, success: false, actionUrl: null, error: null })

      const requestBody = {
        headline: uploadOptions.metadata.headline,
        description: uploadOptions.metadata.description,
        caption: uploadOptions.metadata.caption || null,
        author_name: uploadOptions.metadata.authorName || uploadOptions.metadata.author_name || null,
        publication_link: uploadOptions.metadata.publicationLink || uploadOptions.metadata.publication_link || null,
        image_description: uploadOptions.metadata.image_description || null,
        template_id: selectedTemplate,
        session_id: uploadOptions.metadata.session_id || null,
        export_format: 'png' // PNG is best for Hive preview
      }

      const response = await axios.post(
        `${API_BASE_URL}/submit-to-hive`,
        requestBody,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 120000,
        }
      )

      if (response.data.success) {
        setHiveSubmission({
          submitting: false,
          success: true,
          actionUrl: response.data.action_url,
          error: null
        })
      } else {
        setHiveSubmission({
          submitting: false,
          success: false,
          actionUrl: null,
          error: response.data.error || 'Failed to submit to Hive'
        })
      }
    } catch (error) {
      console.error('Hive submission error:', error)
      setHiveSubmission({
        submitting: false,
        success: false,
        actionUrl: null,
        error: error.response?.data?.error || error.message || 'Failed to submit to Hive'
      })
    }
  }

  const formatOptions = [
    { value: 'pptx', label: 'PowerPoint (.pptx)', description: 'Editable presentation file' },
    { value: 'png', label: 'PNG Image (.png)', description: 'High quality image' },
    { value: 'jpg', label: 'JPEG Image (.jpg)', description: 'Compressed image for web' },
  ]

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white p-8 space-y-6 border-2" style={{borderColor: '#ccc'}}>
          {/* Header */}
          <div className="text-left">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Doug, your Digital Screen AI Agent
              </h1>
              <img
                src="/cbs-logo.png"
                alt="Columbia Business School Hermes Logo"
                className="h-12 w-auto"
              />
            </div>
            <p className="text-gray-600 font-bold pb-2 mb-6 border-b" style={{borderBottomColor: '#ccc'}}>
              Create digital screen slides with your direct input at every step
            </p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-700 font-medium">Who is Doug?</span>
                <div className="relative group">
                  <svg
                    className="w-4 h-4 text-gray-400 cursor-help"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path strokeLinecap="round" strokeWidth="2" d="M12 16v-4M12 8h.01" />
                  </svg>
                  <div className="absolute left-0 top-full mt-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs z-10">
                    Doug is the Digitally Optimized Upload Generator.
                    <div className="absolute bottom-full left-4 -mb-1 border-4 border-transparent border-b-gray-900"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-700 font-medium">How does Doug work?</span>
                <div className="relative group">
                  <svg
                    className="w-4 h-4 text-gray-400 cursor-help"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path strokeLinecap="round" strokeWidth="2" d="M12 16v-4M12 8h.01" />
                  </svg>
                  <div className="absolute left-0 top-full mt-2 hidden group-hover:block w-80 p-3 bg-gray-900 text-white text-xs z-10">
                    Doug uses OpenAI for image analysis and generates slides locally - instant exports with no external dependencies!
                    <div className="absolute bottom-full left-4 -mb-1 border-4 border-transparent border-b-gray-900"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-700 font-medium">Can Doug Send the Screen to Hive?</span>
                <div className="relative group">
                  <svg
                    className="w-4 h-4 text-gray-400 cursor-help"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path strokeLinecap="round" strokeWidth="2" d="M12 16v-4M12 8h.01" />
                  </svg>
                  <div className="absolute left-0 top-full mt-2 hidden group-hover:block w-80 p-3 bg-gray-900 text-white text-xs z-10">
                    Yes, once the generated AI slide is created, there is an option to send the slide as a digital screen request directly to Hive.
                    <div className="absolute bottom-full left-4 -mb-1 border-4 border-transparent border-b-gray-900"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          {status === 'idle' && (
            <UploadForm onSubmit={handleFormSubmit} />
          )}

          {(status === 'processing' || status === 'generating') && (
            <StatusDisplay
              status={status}
              message={message}
              progress={progress}
            />
          )}

          {/* Review metadata */}
          {status === 'review' && metadataSummary && (
            <div className="space-y-4">
              {/* Metadata Summary Section */}
              <div className="p-4 bg-blue-50">
                <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-blue-300">
                  Your Slide Information
                </h3>
                <div className="text-sm text-gray-800 leading-relaxed">
                  <pre className="whitespace-pre-wrap font-sans">
                    {metadataSummary}
                  </pre>
                </div>
              </div>

              <div className="p-4" style={{backgroundColor: '#f1f4f7'}}>
                <h3 className="font-semibold text-gray-900 mb-2 pb-2 border-b" style={{borderBottomColor: '#d9dfe5'}}>Next Steps</h3>
                <p className="text-base text-gray-700">
                  Review your slide information above, select a template and export format below.
                </p>
              </div>

              {/* Template and Format Selection */}
              <div className="p-4 border-2 border-gray-200 space-y-6">
                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Brand Template
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                  >
                    <option value="template1">Template 1 - Default CBS Blue</option>
                    <option value="template2">Template 2 - Dark Theme</option>
                    <option value="template3">Template 3 - Light Theme</option>
                  </select>
                </div>

                {/* Preview Component */}
                <SlidePreview
                  metadata={uploadOptions?.metadata}
                  template={selectedTemplate}
                />

                {/* Export Format Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Export Format
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {formatOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelectedFormat(option.value)}
                        className={`p-3 border-2 text-left transition-all ${
                          selectedFormat === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900 text-sm">{option.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleExport(selectedFormat)}
                  className="max-w-fit text-white font-medium py-3 px-6 transition-colors duration-200 flex items-center gap-2"
                  style={{backgroundColor: '#181a1c'}}
                >
                  <span>Export as {selectedFormat.toUpperCase()}</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="#009bdb"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                </button>
                <button
                  onClick={handleReset}
                  className="max-w-fit bg-white text-gray-700 font-medium py-3 px-6 transition-colors duration-200 border-2 flex items-center gap-2"
                  style={{borderColor: '#ccc'}}
                >
                  <span>Start Over</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="#009bdb"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 4v6h6M23 20v-6h-6" />
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <StatusDisplay
                status={status}
                message={message}
                progress={progress}
              />

              {/* Export format buttons for additional formats */}
              <div className="p-4 border-2 border-gray-200">
                <p className="text-sm text-gray-600 mb-3">Export in other formats:</p>
                <div className="flex flex-wrap gap-2">
                  {formatOptions.filter(f => f.value !== exportedFile?.format).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleExport(option.value)}
                      className="px-4 py-2 text-sm border-2 border-gray-300 hover:border-gray-400 transition-colors"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Download and Create Another buttons */}
              <div className="p-4 border-2 border-gray-200">
                <p className="text-sm text-gray-600 mb-3">Download your materials:</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleDownload}
                    className="max-w-fit text-white font-medium py-3 px-6 transition-colors duration-200 flex items-center gap-2"
                    style={{backgroundColor: '#181a1c'}}
                  >
                    <span>Download {exportedFile?.format.toUpperCase()}</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="#009bdb"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                  </button>
                  <button
                    onClick={handleReset}
                    className="max-w-fit bg-white text-gray-700 font-medium py-3 px-6 transition-colors duration-200 border-2 flex items-center gap-2"
                    style={{borderColor: '#ccc'}}
                  >
                    <span>Create Another</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="#009bdb"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 4v6h6M23 20v-6h-6" />
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Hive Submission Section */}
              <div className="p-4 bg-blue-50 text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Submit to MarComms
                </h4>
                <p className="text-base text-gray-600 mb-3">
                  Create a service request in Hive with your slide attached for MarComms review.
                </p>

                {/* Hive submission status */}
                {hiveSubmission?.submitting && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm">Submitting to Hive...</span>
                  </div>
                )}

                {hiveSubmission?.success && (
                  <div className="p-3 bg-green-100 border border-green-300 text-green-800 text-sm">
                    <p className="font-medium">Successfully submitted to Hive!</p>
                    {hiveSubmission.actionUrl && (
                      <a
                        href={hiveSubmission.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline mt-1 inline-block"
                      >
                        View in Hive
                      </a>
                    )}
                  </div>
                )}

                {hiveSubmission?.error && (
                  <div className="p-3 bg-red-100 border border-red-300 text-red-800 text-sm">
                    <p className="font-medium">Failed to submit:</p>
                    <p>{hiveSubmission.error}</p>
                  </div>
                )}

                {!hiveSubmission?.submitting && !hiveSubmission?.success && (
                  <button
                    onClick={handleSubmitToHive}
                    className="mx-auto bg-white text-gray-700 font-medium py-3 px-6 transition-colors duration-200 border-2 flex items-center gap-2"
                    style={{borderColor: '#ccc'}}
                  >
                    <span>Submit to Hive</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="#009bdb"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <StatusDisplay
                status={status}
                message={message}
                progress={progress}
              />
              <button
                onClick={handleReset}
                className="w-full max-w-fit text-white font-medium py-3 px-6 transition-colors duration-200 flex items-center gap-2"
                style={{backgroundColor: '#181a1c'}}
              >
                <span>Try Again</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="#009bdb"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-200 space-y-3">
            <div className="flex items-center justify-center gap-2">
              {/* CBS Hermes Logo */}
              <img
                src="/cbs-logo.png"
                alt="Columbia Business School Hermes Logo"
                className="h-8 w-auto"
              />
              <span className="text-sm text-gray-900 font-medium">Doug, an agentic tool by Columbia Business School</span>
            </div>
            <p className="text-sm text-gray-700 font-bold">Powered by OpenAI and Hive</p>
            <p className="text-xs text-gray-500">
              Have suggestions or any questions? Please reach out to{' '}
              <a href="mailto:communications@gsb.columbia.edu" className="underline">
                communications@gsb.columbia.edu
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
