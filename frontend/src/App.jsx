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
      setProgress(0)
      setDownloadUrl(null)
      setSynthesizedContent(null)
      setUploadOptions(options)

      // Gradually increase progress to 30%
      const uploadInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 2, 30))
      }, 100)

      const formData = new FormData()
      formData.append('file', file)

      await new Promise(resolve => setTimeout(resolve, 500))
      clearInterval(uploadInterval)
      setProgress(30)

      setMessage('Analyzing content with AI...')

      // Gradually increase progress to 70% during AI processing
      const aiInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 1, 70))
      }, 200)

      // Step 1: Synthesize content with OpenAI
      const synthesisResponse = await axios.post(
        `${API_BASE_URL}/synthesize-content`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 180000, // 3 minute timeout
        }
      )

      clearInterval(aiInterval)
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

      // Show synthesized content for review
      setSynthesizedContent(synthesisResponse.data.synthesized_text)
      setStatus('review')
      await new Promise(resolve => setTimeout(resolve, 500))
      clearInterval(finalInterval)
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
      setMessage('Packaging your screen template material...')
      setProgress(0)

      // Gradually increase progress to 40%
      const initialInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 2, 40))
      }, 100)

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

      await new Promise(resolve => setTimeout(resolve, 500))
      clearInterval(initialInterval)
      setProgress(40)

      // Gradually increase progress to 80% during generation
      const generationInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 1, 80))
      }, 250)

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
          timeout: 300000, // 5 minutes timeout
        }
      )

      clearInterval(generationInterval)
      setProgress(80)
      setMessage('Formatting for digital screens...')

      // Final progress to 100%
      const finalInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(finalInterval)
            return 100
          }
          return prev + 4
        })
      }, 50)

      if (response.data.status === 'success') {
        await new Promise(resolve => setTimeout(resolve, 300))
        clearInterval(finalInterval)
        setProgress(100)
        setStatus('success')
        setMessage('Event slides ready for digital screens!')
        setDownloadUrl(response.data.download_url)
      } else if (response.data.status === 'processing') {
        setStatus('processing')
        setMessage('Creating your screen template. This may take a moment.')
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white p-8 space-y-6 border-2" style={{borderColor: '#ccc'}}>
          {/* Header */}
          <div className="text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Digital Screen Template Generator
            </h1>
            <p className="text-gray-600 font-bold pb-2 mb-6 border-b" style={{borderBottomColor: '#ccc'}}>
              Create starting point templates for digital screens
            </p>
            <p className="text-sm text-gray-500 mt-2">
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
              <div className="p-4" style={{backgroundColor: '#f1f4f7'}}>
                <h3 className="font-semibold text-gray-900 mb-2 pb-2 border-b" style={{borderBottomColor: '#d9dfe5'}}>Content That Will Be Used</h3>
                <p className="text-sm text-gray-700">
                  Review the digital screen content that will be sent to generate your template:
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
                  className="max-w-fit text-white font-medium py-3 px-6 transition-colors duration-200 flex items-center gap-2"
                  style={{backgroundColor: '#181a1c'}}
                >
                  <span>Finalize & Generate Slides</span>
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
                <button
                  onClick={handleReset}
                  className="max-w-fit bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 transition-colors duration-200"
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
                  className="max-w-fit text-white font-medium py-3 px-6 transition-colors duration-200 flex items-center gap-2"
                  style={{backgroundColor: '#181a1c'}}
                >
                  <span>Download Event Slides</span>
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
                <button
                  onClick={handleReset}
                  className="max-w-fit bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 transition-colors duration-200"
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
          <div className="text-right pt-4 border-t border-gray-200 space-y-3">
            <div className="flex items-center justify-end gap-2">
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
