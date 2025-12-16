import SlidePreview from '../components/SlidePreview'
import StepTimeline from '../components/StepTimeline'
import FormatSelector from '../components/FormatSelector'

/**
 * ReviewScreen - Step 2: Template selection and preview
 */
function ReviewScreen({
  metadataSummary,
  displayedSummary,
  isStreaming,
  uploadOptions,
  selectedTemplate,
  setSelectedTemplate,
  selectedFormat,
  setSelectedFormat,
  categoryTemplates,
  formatOptions,
  onGoBackToEdit,
  onExport,
  onReset,
}) {
  return (
    <div className="space-y-4">
      {/* Step Timeline */}
      <StepTimeline
        currentStep={2}
        onStepClick={(step) => {
          if (step === 1) onGoBackToEdit()
        }}
      />

      {/* Metadata Summary Section */}
      <div className="p-4 bg-blue-50">
        <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">
          Your Screen Information
        </h3>
        <div className="text-sm text-gray-800 leading-relaxed">
          <pre className="whitespace-pre-wrap font-sans">
            {displayedSummary.split(/(https?:\/\/[^\s)]+)/).map((part, index) => {
              if (part.match(/^https?:\/\//)) {
                return (
                  <a
                    key={index}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {part}
                  </a>
                )
              }
              return part
            })}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-blue-600 ml-0.5 animate-pulse" />
            )}
          </pre>
        </div>
      </div>

      {/* Template and Format Selection */}
      <div className="p-4 border-2 border-gray-200 space-y-6">
        {/* Template Selection */}
        <div className="w-[65%] mx-auto">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Select Brand Template
            </label>
            <p className="text-xs text-gray-500 mb-1">
              Templates for {uploadOptions?.metadata?.slideCategory?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
            <div className="relative">
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-0 py-2 pr-8 border-0 border-b-2 border-gray-500 hover:border-[#181a1c] focus:border-[#009bdb] focus:hover:border-[#009bdb] focus:outline-none focus:ring-0 bg-transparent text-gray-900 appearance-none cursor-pointer transition-all duration-300 ease-in-out [&>option]:bg-[#181a1c] [&>option]:text-[#009bdb] [&>option]:py-2"
              >
                {categoryTemplates.length > 0 ? (
                  categoryTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="template1">Template 1 - Default CBS Blue</option>
                    <option value="template2">Template 2 - Dark Theme</option>
                    <option value="template3">Template 3 - Light Theme</option>
                  </>
                )}
              </select>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-[#009bdb]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            {categoryTemplates.length > 0 && selectedTemplate && (
              <p className="text-xs text-gray-400 mt-1">
                {categoryTemplates.find(t => t.id === selectedTemplate)?.description}
              </p>
            )}
          </div>
        </div>

        {/* Preview Component */}
        <SlidePreview
          metadata={uploadOptions?.metadata}
          template={selectedTemplate}
          templateStyle={categoryTemplates.find(t => t.id === selectedTemplate)}
        />

        {/* Export Format Selection */}
        <FormatSelector
          formatOptions={formatOptions}
          selectedFormat={selectedFormat}
          onSelectFormat={setSelectedFormat}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onGoBackToEdit}
          className="max-w-fit bg-white text-gray-700 font-medium py-3 px-6 transition-colors duration-200 border-2 flex items-center gap-2"
          style={{ borderColor: '#ccc' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="#009bdb" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Go Back</span>
        </button>
        <button
          onClick={() => onExport(selectedFormat)}
          className="max-w-fit text-white font-medium py-3 px-6 transition-colors duration-200 flex items-center gap-2"
          style={{ backgroundColor: '#181a1c' }}
        >
          <span>Export as {selectedFormat.toUpperCase()}</span>
          <svg className="w-5 h-5" fill="none" stroke="#009bdb" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
        </button>
        <button
          onClick={onReset}
          className="max-w-fit bg-white text-gray-700 font-medium py-3 px-6 transition-colors duration-200 border-2 flex items-center gap-2"
          style={{ borderColor: '#ccc' }}
        >
          <span>Start Over</span>
          <svg className="w-5 h-5" fill="none" stroke="#009bdb" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 4v6h6M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default ReviewScreen
