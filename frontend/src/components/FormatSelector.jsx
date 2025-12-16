/**
 * FormatSelector - Export format selection buttons (PPTX, PNG, JPG)
 */
function FormatSelector({ formatOptions, selectedFormat, onSelectFormat }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Select Export Format
      </label>
      <div className="grid grid-cols-3 gap-3">
        {formatOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelectFormat(option.value)}
            className={`p-3 border-2 text-left transition-all ${
              selectedFormat === option.value
                ? 'border-[#009bdb] bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-gray-900 text-sm">{option.label}</div>
                <div className="text-xs text-gray-500 mt-1">{option.description}</div>
              </div>
              <div className="flex-shrink-0">{option.icon}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default FormatSelector
