import UploadForm from './components/UploadForm'
import StatusDisplay from './components/StatusDisplay'
import { useSlideWorkflow } from './hooks'
import { ReviewScreen, SuccessScreen } from './screens'
import { containerStyles } from './styles/constants'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Format options for export
const formatOptions = [
  {
    value: 'pptx',
    label: 'PowerPoint (.pptx)',
    description: 'Editable presentation file',
    icon: (
      <svg className="w-6 h-6 text-[#009bdb]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    )
  },
  {
    value: 'png',
    label: 'PNG Image (.png)',
    description: 'High quality image',
    icon: (
      <svg className="w-6 h-6 text-[#009bdb]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    )
  },
  {
    value: 'jpg',
    label: 'JPEG Image (.jpg)',
    description: 'Compressed image for web',
    icon: (
      <svg className="w-6 h-6 text-[#009bdb]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
      </svg>
    )
  },
]

function App() {
  const workflow = useSlideWorkflow(API_BASE_URL)

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#e3f2f8' }}>
      <div className="w-full max-w-4xl">
        <div className="bg-white p-8 space-y-6" style={containerStyles}>
          {/* Header */}
          <AppHeader />

          {/* Main Content */}
          {workflow.status === 'idle' && (
            <UploadForm
              onSubmit={workflow.handleFormSubmit}
              apiBaseUrl={API_BASE_URL}
              initialData={workflow.uploadOptions?.metadata}
            />
          )}

          {(workflow.status === 'processing' || workflow.status === 'generating') && (
            <StatusDisplay
              status={workflow.status}
              message={workflow.message}
              progress={workflow.progress}
            />
          )}

          {workflow.status === 'review' && workflow.metadataSummary && (
            <ReviewScreen
              metadataSummary={workflow.metadataSummary}
              displayedSummary={workflow.displayedSummary}
              isStreaming={workflow.isStreaming}
              uploadOptions={workflow.uploadOptions}
              selectedTemplate={workflow.selectedTemplate}
              setSelectedTemplate={workflow.setSelectedTemplate}
              selectedFormat={workflow.selectedFormat}
              setSelectedFormat={workflow.setSelectedFormat}
              categoryTemplates={workflow.categoryTemplates}
              formatOptions={formatOptions}
              onGoBackToEdit={workflow.handleGoBackToEdit}
              onExport={workflow.handleExport}
              onReset={workflow.handleReset}
            />
          )}

          {workflow.status === 'success' && (
            <SuccessScreen
              message={workflow.message}
              progress={workflow.progress}
              exportedFile={workflow.exportedFile}
              formatOptions={formatOptions}
              onGoBackToEdit={workflow.handleGoBackToEdit}
              onGoBackToReview={workflow.handleGoBackToReview}
              onExport={workflow.handleExport}
              onDownload={workflow.handleDownload}
              onReset={workflow.handleReset}
            />
          )}

          {workflow.status === 'error' && (
            <div className="space-y-4">
              <StatusDisplay
                status={workflow.status}
                message={workflow.message}
                progress={workflow.progress}
              />
              <button
                onClick={workflow.handleReset}
                className="w-full max-w-fit text-white font-medium py-3 px-6 transition-colors duration-200 flex items-center gap-2"
                style={{ backgroundColor: '#181a1c' }}
              >
                <span>Try Again</span>
                <svg className="w-5 h-5" fill="none" stroke="#009bdb" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Footer */}
          <AppFooter />
        </div>
      </div>
    </div>
  )
}

// Header component
function AppHeader() {
  return (
    <div className="text-left">
      <div className="flex items-start justify-between mb-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Doug, your Digital Screen AI Agent
        </h1>
        <img
          src="/cbs-logo.png"
          alt="Columbia Business School Hermes Logo"
          className="h-12 w-auto"
        />
      </div>
      <p className="text-gray-600 font-bold pb-2 mb-6 border-b" style={{ borderBottomColor: '#ccc' }}>
        Create digital screen slides with your direct input at every step
      </p>
      <div className="flex items-center gap-3 mt-2">
        <TooltipInfo
          label="Who is Doug?"
          tooltip="Doug is the Digitally Optimized Upload Generator."
        />
        <TooltipInfo
          label="How does Doug work?"
          tooltip="Doug utilizes OpenAI for image analysis, processing slide metadata and digital screen generation - all in one tool."
          wider
        />
      </div>
    </div>
  )
}

// Footer component
function AppFooter() {
  return (
    <div className="text-center pt-4 border-t border-gray-200 space-y-3">
      <div className="flex items-center justify-center gap-2">
        <img
          src="/cbs-logo.png"
          alt="Columbia Business School Hermes Logo"
          className="h-8 w-auto"
        />
        <span className="text-sm text-gray-900 font-medium">Doug, an agentic tool by Columbia Business School</span>
      </div>
      <p className="text-xs text-gray-500">
        Have suggestions or any questions? Please reach out to{' '}
        <a href="mailto:communications@gsb.columbia.edu" className="underline">
          communications@gsb.columbia.edu
        </a>
      </p>
    </div>
  )
}

// Tooltip info component
function TooltipInfo({ label, tooltip, wider }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm text-gray-700 font-medium">{label}</span>
      <div className="relative group">
        <svg
          className="w-4 h-4 text-gray-400 cursor-help"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <path strokeLinecap="round" strokeWidth="2" d="M12 16v-4M12 8h.01" />
        </svg>
        <div className={`absolute left-0 top-full mt-2 hidden group-hover:block ${wider ? 'w-80' : 'w-64'} p-3 bg-gray-900 text-white text-xs z-10`}>
          {tooltip}
          <div className="absolute bottom-full left-4 -mb-1 border-4 border-transparent border-b-gray-900"></div>
        </div>
      </div>
    </div>
  )
}

export default App
