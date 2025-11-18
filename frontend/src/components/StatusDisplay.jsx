function StatusDisplay({ status, message, progress }) {
  const getStatusIcon = () => {
    if (status === 'uploading' || status === 'processing') {
      return (
        <svg
          className="animate-spin h-12 w-12 text-primary-600"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )
    }

    if (status === 'success') {
      return (
        <svg
          className="h-12 w-12 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
    }

    if (status === 'error') {
      return (
        <svg
          className="h-12 w-12 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
    }

    return null
  }

  const getStatusColor = () => {
    if (status === 'success') return 'text-green-700'
    if (status === 'error') return 'text-red-700'
    return 'text-gray-700'
  }

  return (
    <div className="py-8 space-y-6">
      {/* Status Icon */}
      <div className="flex justify-center">
        {getStatusIcon()}
      </div>

      {/* Status Message */}
      <div className="text-center">
        <p className={`text-lg font-medium ${getStatusColor()}`}>
          {message}
        </p>
      </div>

      {/* Progress Bar */}
      {(status === 'uploading' || status === 'processing') && progress > 0 && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-primary-600 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-600">
            {progress}%
          </p>
        </div>
      )}

      {/* Additional Info */}
      {status === 'processing' && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            This may take up to 2 minutes. Please don't close this window.
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Your 3-slide event presentation is ready for campus digital screens!
          </p>
          <p className="text-xs text-gray-500">
            Optimized dimensions for digital display
          </p>
        </div>
      )}
    </div>
  )
}

export default StatusDisplay
