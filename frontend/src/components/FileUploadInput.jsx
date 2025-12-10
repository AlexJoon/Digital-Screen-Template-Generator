import { useState } from 'react'

function FileUploadInput({
  label,
  value,
  onChange,
  required = false,
  accept = 'image/*',
  helpText = null,
  enableAICrop = false,
  apiBaseUrl = 'http://localhost:8000',
  onCropComplete = null
}) {
  const [preview, setPreview] = useState(null)
  const [croppedPreview, setCroppedPreview] = useState(null)
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [cropInfo, setCropInfo] = useState(null)
  const [useCropped, setUseCropped] = useState(true)
  const [originalFile, setOriginalFile] = useState(null)
  const [croppedFile, setCroppedFile] = useState(null)

  const processImageWithAI = async (file) => {
    setIsProcessing(true)
    setError('')
    setOriginalFile(file)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(`${apiBaseUrl}/analyze-and-crop-image`, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success && result.cropped_image_base64) {
        const croppedUrl = `data:image/jpeg;base64,${result.cropped_image_base64}`
        setCroppedPreview(croppedUrl)
        setCropInfo(result.crop_info)

        // Convert base64 to blob for the cropped file
        const byteCharacters = atob(result.cropped_image_base64)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const croppedBlob = new Blob([byteArray], { type: 'image/jpeg' })
        const newCroppedFile = new File([croppedBlob], `cropped_${file.name}`, { type: 'image/jpeg' })

        setCroppedFile(newCroppedFile)

        if (onCropComplete) {
          onCropComplete({
            originalFile: file,
            croppedFile: newCroppedFile,
            hasFace: result.has_face,
            cropInfo: result.crop_info
          })
        }

        // Use cropped version by default
        onChange(newCroppedFile)
        setUseCropped(true)
      } else {
        // AI processing failed, use original
        onChange(file)
        setCroppedFile(null)
        if (result.error) {
          console.warn('AI crop warning:', result.error)
        }
      }
    } catch (err) {
      console.error('AI crop error:', err)
      // Fallback to original on error
      onChange(file)
      setCroppedFile(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type for images
    if (accept.includes('image/') && !file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    setError('')
    setCroppedPreview(null)
    setCropInfo(null)

    // Create preview for original image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }

    // If AI crop is enabled, process the image
    if (enableAICrop && file.type.startsWith('image/')) {
      await processImageWithAI(file)
    } else {
      onChange(file)
    }
  }

  const handleToggleCrop = () => {
    if (useCropped && originalFile) {
      // Switch to original
      setUseCropped(false)
      onChange(originalFile)
    } else if (!useCropped && croppedFile) {
      // Switch back to cropped
      setUseCropped(true)
      onChange(croppedFile)
    }
  }

  const handleClear = () => {
    onChange(null)
    setPreview(null)
    setCroppedPreview(null)
    setCropInfo(null)
    setError('')
    setUseCropped(true)
    setOriginalFile(null)
    setCroppedFile(null)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {helpText && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}

      {!value && !isProcessing ? (
        <div className="flex items-center space-x-3">
          <label
            htmlFor={`file-input-${label}`}
            className="cursor-pointer px-4 py-2 bg-[#181a1c] hover:bg-[#2a2d30] text-white text-sm font-medium transition-colors flex items-center space-x-2"
          >
            <span>Choose File</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="#009bdb" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </label>
          <input
            id={`file-input-${label}`}
            type="file"
            onChange={handleFileChange}
            accept={accept}
            required={required}
            className="hidden"
          />
          <span className="text-sm text-gray-500">No file chosen</span>
        </div>
      ) : isProcessing ? (
        <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200">
          <svg className="animate-spin h-5 w-5 text-[#009bdb]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm text-gray-700">AI is analyzing and optimizing your image...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Show cropped preview if available, otherwise original */}
          <div className="flex gap-4">
            {croppedPreview ? (
              <div className="space-y-1">
                <div className="border-2 border-[#009bdb] p-2 inline-block bg-white">
                  <img
                    src={croppedPreview}
                    alt="AI-Cropped Preview"
                    className="max-w-[200px] max-h-48 object-contain"
                  />
                </div>
                <p className="text-xs text-[#009bdb] font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {cropInfo?.face_detection?.has_face ? 'Face-centered crop' : 'Smart crop'}
                </p>
              </div>
            ) : preview && (
              <div className="border border-gray-300 p-2 inline-block">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-[200px] max-h-48 object-contain"
                />
              </div>
            )}

            {/* Show original as secondary if we have a cropped version */}
            {croppedPreview && preview && !useCropped && (
              <div className="space-y-1 opacity-60">
                <div className="border border-gray-300 p-2 inline-block">
                  <img
                    src={preview}
                    alt="Original"
                    className="max-w-[150px] max-h-36 object-contain"
                  />
                </div>
                <p className="text-xs text-gray-500">Original</p>
              </div>
            )}
          </div>

          {/* Toggle button if cropped version exists */}
          {croppedPreview && preview && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleCrop}
                className="text-xs text-gray-600 hover:text-[#009bdb] underline"
              >
                {useCropped ? 'Use original instead' : 'Use AI-cropped version'}
              </button>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-700 font-medium">
              {value.name}
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}

export default FileUploadInput
