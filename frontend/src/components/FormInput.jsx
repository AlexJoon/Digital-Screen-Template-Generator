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
  const [isFocused, setIsFocused] = useState(false)

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
        <p className="text-sm text-gray-500 mb-1">{helpText}</p>
      )}

      <div className="relative">
        <InputComponent
          type={!isTextarea ? type : undefined}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          rows={isTextarea ? Math.max(1, rows) : undefined}
          className={`w-full px-0 border-0 border-b-2 ${
            error ? 'border-red-500' : isFocused ? 'border-[#009bdb]' : 'border-gray-500 hover:border-[#181a1c]'
          } focus:outline-none focus:ring-0 bg-transparent ${
            isTextarea ? 'resize-none py-2' : 'py-2 pr-6'
          } text-gray-900 placeholder-gray-400 transition-all duration-300 ease-in-out`}
        />

        {/* Dot indicator */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <div className="w-2 h-2 rounded-full bg-[#009bdb]"></div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-1">
        <div>
          {error ? (
            <span className="text-xs text-red-500">{error}</span>
          ) : required ? (
            <span className="text-xs text-gray-400">* Required</span>
          ) : null}
        </div>
        {maxLength && (
          <span className={`text-xs ${
            charCount > maxLength ? 'text-red-500' : 'text-gray-500'
          }`}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  )
}

export default FormInput
