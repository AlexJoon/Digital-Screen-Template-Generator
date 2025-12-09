import { useState } from 'react'

function FormInput({
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  maxLength = null,
  type = 'text',
  rows = 1,
  helpText = null
}) {
  const [charCount, setCharCount] = useState(value?.length || 0)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const newValue = e.target.value
    setCharCount(newValue.length)

    // Validate max length
    if (maxLength && newValue.length > maxLength) {
      setError(`Maximum ${maxLength} characters allowed`)
      return
    } else {
      setError('')
    }

    onChange(newValue)
  }

  const isTextarea = type === 'textarea' || rows > 1
  const InputComponent = isTextarea ? 'textarea' : 'input'

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {helpText && (
        <p className="text-xs text-gray-500 mb-1">{helpText}</p>
      )}

      <InputComponent
        type={!isTextarea ? type : undefined}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        rows={isTextarea ? rows : undefined}
        className={`w-full px-3 py-2 border ${
          error ? 'border-red-500' : 'border-gray-300'
        } focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          isTextarea ? 'resize-none' : ''
        }`}
      />

      <div className="flex justify-between items-center">
        {error && (
          <span className="text-xs text-red-500">{error}</span>
        )}
        {maxLength && (
          <span className={`text-xs ml-auto ${
            charCount > maxLength ? 'text-red-500' : 'text-gray-400'
          }`}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  )
}

export default FormInput
