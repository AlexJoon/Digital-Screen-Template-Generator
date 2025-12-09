import { useState } from 'react'

function FileUploadInput({
  label,
  value,
  onChange,
  required = false,
  accept = 'image/*',
  helpText = null
}) {
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type for images
    if (accept.includes('image/') && !file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    setError('')
    onChange(file)

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClear = () => {
    onChange(null)
    setPreview(null)
    setError('')
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {helpText && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}

      {!value ? (
        <div className="flex items-center space-x-3">
          <label
            htmlFor={`file-input-${label}`}
            className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 text-sm font-medium transition-colors"
          >
            Choose File
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
      ) : (
        <div className="space-y-2">
          {preview && (
            <div className="border border-gray-300 p-2 inline-block">
              <img
                src={preview}
                alt="Preview"
                className="max-w-xs max-h-48 object-contain"
              />
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
