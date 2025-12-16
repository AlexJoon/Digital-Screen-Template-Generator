import React from 'react'
import StatusDisplay from '../components/StatusDisplay'
import StepTimeline from '../components/StepTimeline'
import { sectionStyles } from '../styles/constants'

/**
 * SuccessScreen - Step 3: Download and submit to Hive
 */
function SuccessScreen({
  message,
  progress,
  exportedFile,
  formatOptions,
  onGoBackToEdit,
  onGoBackToReview,
  onExport,
  onDownload,
  onReset,
}) {
  const handleSubmitToHive = () => {
    window.open('https://forms.hive.com/?formId=MdHmoupShneudNSce', '_blank')
  }

  return (
    <div className="space-y-4">
      {/* Step Timeline - All Complete */}
      <StepTimeline
        currentStep={3}
        onStepClick={(step) => {
          if (step === 1) onGoBackToEdit()
          if (step === 2) onGoBackToReview()
        }}
      />

      {/* Export format buttons for additional formats */}
      <div style={sectionStyles}>
        <p className="text-md text-gray-600 mb-3">Export in other formats:</p>
        <div className="flex flex-wrap gap-2">
          {formatOptions.filter(f => f.value !== exportedFile?.format).map((option) => (
            <button
              key={option.value}
              onClick={() => onExport(option.value)}
              className="px-4 py-2 text-sm border-2 border-gray-300 hover:border-gray-400 transition-colors flex items-center gap-2"
            >
              <span>{option.label}</span>
              <svg className="w-4 h-4" fill="none" stroke="#009bdb" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 4v6h6M23 20v-6h-6" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <StatusDisplay status="success" message={message} progress={progress} />

      {/* Download and Create Another buttons */}
      <div className="pb-8">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onDownload}
            className="text-white font-medium py-3 px-6 transition-colors duration-200 flex items-center gap-2"
            style={{ backgroundColor: '#181a1c' }}
          >
            <span>Download {exportedFile?.format.toUpperCase()}</span>
            <svg className="w-5 h-5" fill="none" stroke="#009bdb" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          </button>
          <button
            onClick={onReset}
            className="bg-white text-gray-700 font-medium py-3 px-6 transition-colors duration-200 border-2 flex items-center gap-2"
            style={{ borderColor: '#ccc' }}
          >
            <span>Create Another</span>
            <svg className="w-5 h-5" fill="none" stroke="#009bdb" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 4v6h6M23 20v-6h-6" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Hive Submission Section */}
      <div className="text-center" style={sectionStyles}>
        <h4 className="text-lg font-semibold text-gray-900 mb-5">
          Submit to MarComms
        </h4>

        {/* Horizontal Stepper */}
        <div className="flex items-center justify-between mb-6 w-full">
          {[
            { num: 1, label: ['Open', 'Form'], bold: false },
            { num: 2, label: ['Select', 'Digital Screens'], bold: false },
            { num: 3, label: ['Select', 'Role'], bold: false },
            { num: 4, label: ['Website', 'Promotion?'], bold: false },
            { num: 5, label: ['Set', 'Dates'], bold: false },
            { num: 6, label: ['Upload', 'Doug Slide'], bold: true },
          ].map((step, idx, arr) => (
            <React.Fragment key={step.num}>
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-[#009bdb] text-white flex items-center justify-center text-base font-semibold mb-2">
                  {step.num}
                </div>
                <span className={`text-sm text-gray-700 text-center leading-tight ${step.bold ? 'font-bold' : ''}`}>
                  {step.label[0]}<br />{step.label[1]}
                </span>
              </div>
              {idx < arr.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-300 mx-2 -mt-6"></div>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={handleSubmitToHive}
          className="mx-auto bg-[#009bdb] hover:bg-[#007bb0] text-white font-medium py-3 px-6 transition-colors duration-200 flex items-center gap-2"
        >
          <span>Open Service Request Form</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default SuccessScreen
