import { useState } from 'react'
import axios from 'axios'
import UploadForm from './components/UploadForm'
import StatusDisplay from './components/StatusDisplay'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

function App() {
  const [status, setStatus] = useState('idle') // idle, uploading, processing, review, generating, success, error
  const [message, setMessage] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [progress, setProgress] = useState(0)
  const [synthesizedContent, setSynthesizedContent] = useState(null)
  const [uploadOptions, setUploadOptions] = useState(null)

  const handleFileUpload = async (file, options) => {
    try {
      setStatus('uploading')
      setMessage('Uploading event content...')
      setProgress(20)
      setDownloadUrl(null)
      setSynthesizedContent(null)
      setUploadOptions(options)

      const formData = new FormData()
      formData.append('file', file)

      setProgress(40)
      setMessage('Analyzing content with AI...')

      // Step 1: Synthesize content with OpenAI
      const synthesisResponse = await axios.post(
        `${API_BASE_URL}/synthesize-content`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 1 minute timeout
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 30) / progressEvent.total)
            setProgress(40 + percentCompleted)
          }
        }
      )

      setProgress(80)

      // Show synthesized content for review
      setSynthesizedContent(synthesisResponse.data.synthesized_text)
      setStatus('review')
      setProgress(100)
      setMessage('Content ready for review')

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

  const handleFinalize = async () => {
    try {
      setStatus('generating')
      setMessage('Generating branded slides...')
      setProgress(20)

      // Add optional parameters
      const params = new URLSearchParams({
        tone: uploadOptions.tone || 'professional',
        verbosity: uploadOptions.verbosity || 'standard',
        language: uploadOptions.language || 'en',
        fetch_images: uploadOptions.fetchImages !== false ? 'true' : 'false'
      })

      if (uploadOptions.customInstructions) {
        params.append('custom_instructions', uploadOptions.customInstructions)
      }

      setProgress(40)

      // Step 2: Generate presentation with synthesized content
      const response = await axios.post(
        `${API_BASE_URL}/generate-presentation?${params.toString()}`,
        {
          plain_text: synthesizedContent
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 120000, // 2 minutes timeout
        }
      )

      setProgress(80)
      setMessage('Formatting for digital screens...')

      if (response.data.status === 'success') {
        setProgress(100)
        setStatus('success')
        setMessage('Event slides ready for digital screens!')
        setDownloadUrl(response.data.download_url)
      } else if (response.data.status === 'processing') {
        setStatus('processing')
        setMessage('Creating your event slides. This may take a moment...')
        // Poll for status if async
        pollTaskStatus(response.data.task_id)
      }
    } catch (error) {
      console.error('Generation error:', error)
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

  const pollTaskStatus = async (taskId) => {
    const maxAttempts = 30
    let attempts = 0

    const poll = setInterval(async () => {
      try {
        attempts++
        const response = await axios.get(`${API_BASE_URL}/task-status/${taskId}`)

        if (response.data.status === 'completed') {
          clearInterval(poll)
          setProgress(100)
          setStatus('success')
          setMessage('Event slides ready for digital screens!')
          setDownloadUrl(response.data.download_url)
        } else if (response.data.status === 'failed') {
          clearInterval(poll)
          setStatus('error')
          setMessage('Failed to generate event slides. Please try again.')
        } else if (attempts >= maxAttempts) {
          clearInterval(poll)
          setStatus('error')
          setMessage('Timeout creating slides. Please try again.')
        }
      } catch (error) {
        clearInterval(poll)
        setStatus('error')
        setMessage('Error checking status. Please try again.')
      }
    }, 3000) // Poll every 3 seconds
  }

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank')
    }
  }

  const handleReset = () => {
    setStatus('idle')
    setMessage('')
    setDownloadUrl(null)
    setProgress(0)
    setSynthesizedContent(null)
    setUploadOptions(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white p-8 space-y-6 border-2" style={{borderColor: '#ccc'}}>
          {/* Header */}
          <div className="text-left space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Digital Screen Template Generator
            </h1>
            <p className="text-gray-600">
              Create digital screen starting points for digital campus screens
            </p>
            <p className="text-sm text-gray-500">
              For staff at CBS Centers & Programs
            </p>
            <div className="flex items-center justify-start gap-2 text-xs text-gray-400 mt-3">
              <span>Supported formats:</span>
              <span className="inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                </svg>
                PDF
              </span>
              <span className="text-gray-300">•</span>
              <span className="inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm8-10H9v2h5v-2zm0 3H9v2h5v-2z"/>
                </svg>
                Word
              </span>
              <span className="text-gray-300">•</span>
              <span className="inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm3-5h6v2H9v-2zm0-3h6v2H9v-2z"/>
                </svg>
                PowerPoint
              </span>
              <span className="text-gray-300">•</span>
              <span className="inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm2-6h8v2H8v-2zm0 3h8v2H8v-2zm0-6h5v2H8v-2z"/>
                </svg>
                Text
              </span>
            </div>
          </div>

          {/* Main Content */}
          {status === 'idle' && (
            <UploadForm onUpload={handleFileUpload} />
          )}

          {(status === 'uploading' || status === 'processing' || status === 'generating') && (
            <StatusDisplay
              status={status}
              message={message}
              progress={progress}
            />
          )}

          {/* Review synthesized content */}
          {status === 'review' && synthesizedContent && (
            <div className="space-y-4">
              <div className="bg-primary-50 border border-primary-200 p-4">
                <h3 className="font-semibold text-primary-900 mb-2">AI-Synthesized Event Content</h3>
                <p className="text-sm text-primary-700 mb-3">
                  Review the content that will be sent to generate your slides:
                </p>
              </div>

              <div className="bg-white border-2 border-gray-200 p-6 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                  {synthesizedContent}
                </pre>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleFinalize}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 transition-colors duration-200"
                >
                  Finalize & Generate Slides
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 transition-colors duration-200"
                >
                  Start Over
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
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 transition-colors duration-200"
                >
                  Download Event Slides
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 transition-colors duration-200"
                >
                  Create Another Event
                </button>
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
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 transition-colors duration-200"
              >
                Try Again
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
              <span className="text-sm text-gray-900 font-medium">A tool by Columbia Business School</span>
            </div>
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
