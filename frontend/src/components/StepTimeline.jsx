/**
 * StepTimeline - Horizontal 3-step progress indicator
 * Steps: 1. Enter Info, 2. Select Template, 3. Export
 */

import { sectionStyles } from '../styles/constants'

function StepTimeline({ currentStep, onStepClick }) {
  const steps = [
    { num: 1, label: 'Enter Info' },
    { num: 2, label: 'Select Template' },
    { num: 3, label: 'Export' },
  ]

  const isCompleted = (stepNum) => stepNum < currentStep
  const isCurrent = (stepNum) => stepNum === currentStep
  const isClickable = (stepNum) => stepNum < currentStep && onStepClick

  const renderStepCircle = (step) => {
    if (isClickable(step.num)) {
      return (
        <button
          onClick={() => onStepClick(step.num)}
          className="flex flex-col items-center group cursor-pointer"
          title={`Go back to ${step.label.toLowerCase()}`}
        >
          <div className="w-8 h-8 rounded-full bg-[#009bdb] flex items-center justify-center group-hover:ring-2 group-hover:ring-[#009bdb] group-hover:ring-offset-2 transition-all">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-xs font-medium text-gray-700 mt-2 text-center group-hover:text-[#009bdb] transition-colors">
            {step.label}
          </span>
        </button>
      )
    }

    return (
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isCurrent(step.num)
              ? 'bg-[#181a1c] ring-2 ring-[#009bdb] ring-offset-2'
              : isCompleted(step.num)
              ? 'bg-[#009bdb]'
              : 'bg-gray-300'
          }`}
        >
          {isCompleted(step.num) ? (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span className={`text-sm font-bold ${isCurrent(step.num) ? 'text-white' : 'text-gray-600'}`}>
              {step.num}
            </span>
          )}
        </div>
        <span
          className={`text-xs font-medium mt-2 text-center ${
            isCurrent(step.num) ? 'text-gray-900' : isCompleted(step.num) ? 'text-gray-700' : 'text-gray-500'
          }`}
        >
          {step.label}
        </span>
      </div>
    )
  }

  const renderConnector = (afterStepNum) => {
    const isActive = isCompleted(afterStepNum + 1) || isCurrent(afterStepNum + 1)
    return (
      <div className={`flex-1 h-0.5 mx-4 -mt-5 ${isActive ? 'bg-[#009bdb]' : 'bg-gray-300'}`} />
    )
  }

  return (
    <div style={sectionStyles}>
      <div className="flex items-center justify-between">
        {/* Step 1 */}
        {renderStepCircle(steps[0])}

        {/* Connector 1-2 */}
        {renderConnector(1)}

        {/* Step 2 */}
        {renderStepCircle(steps[1])}

        {/* Connector 2-3 */}
        {renderConnector(2)}

        {/* Step 3 */}
        {renderStepCircle(steps[2])}
      </div>
    </div>
  )
}

export default StepTimeline
