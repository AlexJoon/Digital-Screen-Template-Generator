import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

/**
 * useSlideWorkflow - Custom hook managing the slide generation workflow
 * Handles state transitions: idle -> processing -> review -> generating -> success/error
 */
export function useSlideWorkflow(apiBaseUrl) {
  const [status, setStatus] = useState('idle') // idle, processing, review, generating, success, error
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(0)
  const [metadataSummary, setMetadataSummary] = useState(null)
  const [displayedSummary, setDisplayedSummary] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [uploadOptions, setUploadOptions] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedFormat, setSelectedFormat] = useState('pptx')
  const [exportedFile, setExportedFile] = useState(null)
  const [categoryTemplates, setCategoryTemplates] = useState([])
  const streamingRef = useRef(null)

  // Fetch category-specific templates when entering review state
  useEffect(() => {
    const fetchCategoryTemplates = async () => {
      if (status === 'review' && uploadOptions?.metadata?.slideCategory) {
        try {
          const response = await axios.get(
            `${apiBaseUrl}/templates/${uploadOptions.metadata.slideCategory}`
          )
          setCategoryTemplates(response.data.templates)
          if (response.data.templates.length > 0) {
            const templateIds = response.data.templates.map(t => t.id)
            if (!selectedTemplate || !templateIds.includes(selectedTemplate)) {
              setSelectedTemplate(response.data.templates[0].id)
            }
          }
        } catch (error) {
          console.error('Error fetching templates:', error)
          setCategoryTemplates([])
        }
      }
    }
    fetchCategoryTemplates()
  }, [status, uploadOptions?.metadata?.slideCategory, apiBaseUrl])

  // Streaming animation effect for metadata summary
  useEffect(() => {
    if (status === 'review' && metadataSummary && !isStreaming && displayedSummary !== metadataSummary) {
      setIsStreaming(true)
      setDisplayedSummary('')

      let currentIndex = 0
      const streamSpeed = 5

      streamingRef.current = setInterval(() => {
        if (currentIndex < metadataSummary.length) {
          setDisplayedSummary(metadataSummary.slice(0, currentIndex + 1))
          currentIndex++
        } else {
          clearInterval(streamingRef.current)
          setIsStreaming(false)
        }
      }, streamSpeed)
    }

    return () => {
      if (streamingRef.current) {
        clearInterval(streamingRef.current)
      }
    }
  }, [status, metadataSummary])

  const handleFormSubmit = async (options) => {
    try {
      setStatus('processing')
      setMessage('Analyzing your slide information...')
      setProgress(0)
      setMetadataSummary(null)
      setUploadOptions(options)
      setExportedFile(null)

      const processingInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 2, 50))
      }, 100)

      const formData = new FormData()

      if (options.metadata) {
        if (options.metadata.slideCategory) formData.append('slide_category', options.metadata.slideCategory)
        if (options.metadata.headline) formData.append('headline', options.metadata.headline)
        if (options.metadata.caption) formData.append('caption', options.metadata.caption)
        if (options.metadata.description) formData.append('description', options.metadata.description)
        if (options.metadata.authorName) formData.append('author_name', options.metadata.authorName)
        if (options.metadata.publicationLink) formData.append('publication_link', options.metadata.publicationLink)
        if (options.metadata.eventDate) formData.append('event_date', options.metadata.eventDate)
        if (options.metadata.eventTime) formData.append('event_time', options.metadata.eventTime)
        if (options.metadata.eventLocation) formData.append('event_location', options.metadata.eventLocation)
        if (options.metadata.image) {
          formData.append('image', options.metadata.image)
        }
      }

      setMessage('Processing image and metadata...')

      const metadataResponse = await axios.post(
        `${apiBaseUrl}/process-metadata`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 180000,
        }
      )

      clearInterval(processingInterval)
      setProgress(70)

      const finalInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(finalInterval)
            return 100
          }
          return prev + 3
        })
      }, 50)

      setMetadataSummary(metadataResponse.data.metadata_summary)

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

      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90))
      }, 100)

      const requestBody = {
        headline: uploadOptions.metadata.headline,
        description: uploadOptions.metadata.description,
        caption: uploadOptions.metadata.caption || null,
        author_name: uploadOptions.metadata.authorName || uploadOptions.metadata.author_name || null,
        publication_link: uploadOptions.metadata.publicationLink || uploadOptions.metadata.publication_link || null,
        image_description: uploadOptions.metadata.image_description || null,
        template_id: selectedTemplate,
        session_id: uploadOptions.metadata.session_id || null,
        event_date: uploadOptions.metadata.eventDate || uploadOptions.metadata.event_date || null,
        event_time: uploadOptions.metadata.eventTime || uploadOptions.metadata.event_time || null,
        event_location: uploadOptions.metadata.eventLocation || uploadOptions.metadata.event_location || null,
        slide_category: uploadOptions.metadata.slideCategory || uploadOptions.metadata.slide_category || null
      }

      const response = await axios.post(
        `${apiBaseUrl}/export?format=${format}`,
        requestBody,
        {
          headers: { 'Content-Type': 'application/json' },
          responseType: 'blob',
          timeout: 60000,
        }
      )

      clearInterval(progressInterval)
      setProgress(100)

      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const url = window.URL.createObjectURL(blob)

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

  const handleGoBackToEdit = () => {
    if (streamingRef.current) {
      clearInterval(streamingRef.current)
    }
    setStatus('idle')
    setMessage('')
    setProgress(0)
    setMetadataSummary(null)
    setDisplayedSummary('')
    setIsStreaming(false)
  }

  const handleGoBackToReview = () => {
    if (exportedFile?.url) {
      window.URL.revokeObjectURL(exportedFile.url)
    }
    setStatus('review')
    setMessage('Ready to generate your slide')
    setProgress(100)
    setExportedFile(null)
  }

  const handleReset = () => {
    if (exportedFile?.url) {
      window.URL.revokeObjectURL(exportedFile.url)
    }
    if (streamingRef.current) {
      clearInterval(streamingRef.current)
    }
    setStatus('idle')
    setMessage('')
    setProgress(0)
    setMetadataSummary(null)
    setDisplayedSummary('')
    setIsStreaming(false)
    setUploadOptions(null)
    setSelectedTemplate('template1')
    setSelectedFormat('pptx')
    setExportedFile(null)
  }

  return {
    // State
    status,
    message,
    progress,
    metadataSummary,
    displayedSummary,
    isStreaming,
    uploadOptions,
    selectedTemplate,
    selectedFormat,
    exportedFile,
    categoryTemplates,

    // Setters
    setSelectedTemplate,
    setSelectedFormat,

    // Actions
    handleFormSubmit,
    handleExport,
    handleDownload,
    handleGoBackToEdit,
    handleGoBackToReview,
    handleReset,
  }
}
