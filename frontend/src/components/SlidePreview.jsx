import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'

function SlidePreview({ metadata, template }) {
  const [imageUrl, setImageUrl] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Create object URL for the uploaded image
  useEffect(() => {
    if (metadata?.image) {
      const url = URL.createObjectURL(metadata.image)
      setImageUrl(url)

      // Cleanup
      return () => URL.revokeObjectURL(url)
    } else {
      setImageUrl(null)
    }
  }, [metadata?.image])

  // Get template-specific styles
  const getTemplateStyles = () => {
    switch (template) {
      case 'template1': // Default CBS Blue
        return {
          background: 'linear-gradient(135deg, #003DA5 0%, #0052CC 100%)',
          textColor: 'white',
          accentColor: '#009bdb'
        }
      case 'template2': // Dark Theme
        return {
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          textColor: 'white',
          accentColor: '#009bdb'
        }
      case 'template3': // Light Theme
        return {
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          textColor: '#181a1c',
          accentColor: '#003DA5'
        }
      default:
        return {
          background: 'linear-gradient(135deg, #003DA5 0%, #0052CC 100%)',
          textColor: 'white',
          accentColor: '#009bdb'
        }
    }
  }

  const styles = getTemplateStyles()

  // Render the slide content (reusable for both preview and lightbox)
  const renderSlideContent = (isLightbox = false) => (
    <div
      className={`${isLightbox ? 'w-full h-full' : 'absolute inset-0'} rounded-lg overflow-hidden shadow-lg`}
      style={{ background: styles.background }}
    >
      {/* Background Image with Overlay */}
      {imageUrl && (
        <div className="absolute inset-0">
          <img
            src={imageUrl}
            alt="Slide background"
            className="w-full h-full object-cover opacity-20"
          />
          <div
            className="absolute inset-0"
            style={{ background: styles.background, opacity: 0.85 }}
          />
        </div>
      )}

      {/* Content Container */}
      <div className={`relative h-full ${isLightbox ? 'p-12 md:p-16' : 'p-6 md:p-8'} flex`}>

        {/* Left Side - Text Content (2/3) */}
        <div className="flex-1 flex flex-col justify-between pr-4" style={{ color: styles.textColor }}>

          {/* Top Section - Caption */}
          {metadata?.caption && (
            <div className={`${isLightbox ? 'text-sm md:text-base' : 'text-xs'} opacity-80 uppercase tracking-wide`}>
              {metadata.caption}
            </div>
          )}

          {/* Middle Section - Headline & Description */}
          <div className="flex-1 flex flex-col justify-center space-y-3">
            {metadata?.headline && (
              <h1 className={`${isLightbox ? 'text-3xl md:text-4xl lg:text-5xl' : 'text-xl md:text-2xl lg:text-3xl'} font-bold leading-tight`}>
                {metadata.headline}
              </h1>
            )}

            {metadata?.description && (
              <p className={`${isLightbox ? 'text-base md:text-lg' : 'text-xs md:text-sm'} opacity-90 ${isLightbox ? '' : 'line-clamp-4'}`}>
                {metadata.description}
              </p>
            )}

            {/* Event Details */}
            {(metadata?.eventDate || metadata?.event_date || metadata?.eventTime || metadata?.event_time || metadata?.eventLocation || metadata?.event_location) && (
              <div className={`${isLightbox ? 'text-sm md:text-base' : 'text-xs'} opacity-90 space-y-1`}>
                {(metadata?.eventDate || metadata?.event_date) && (
                  <div className="flex items-center gap-2">
                    <svg className={`${isLightbox ? 'w-4 h-4' : 'w-3 h-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>{metadata?.eventDate || metadata?.event_date}</span>
                  </div>
                )}
                {(metadata?.eventTime || metadata?.event_time) && (
                  <div className="flex items-center gap-2">
                    <svg className={`${isLightbox ? 'w-4 h-4' : 'w-3 h-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>{metadata?.eventTime || metadata?.event_time}</span>
                  </div>
                )}
                {(metadata?.eventLocation || metadata?.event_location) && (
                  <div className="flex items-center gap-2">
                    <svg className={`${isLightbox ? 'w-4 h-4' : 'w-3 h-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{metadata?.eventLocation || metadata?.event_location}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Section - Author */}
          <div className="flex items-center justify-between">
            {metadata?.authorName && (
              <div className={`${isLightbox ? 'text-base md:text-lg' : 'text-xs md:text-sm'}`}>
                <span style={{ color: styles.accentColor }} className="font-semibold">
                  {metadata.authorName}
                </span>
              </div>
            )}

            {/* CBS Logo placeholder */}
            <div className={`${isLightbox ? 'text-sm' : 'text-xs'} opacity-60`}>
              Columbia Business School
            </div>
          </div>
        </div>

        {/* Right Side - Faculty Image and QR Code (1/3) */}
        <div className="w-1/3 flex flex-col items-center justify-center gap-3">
          {imageUrl && (
            <div className={`w-full aspect-square rounded-full overflow-hidden border-4 shadow-lg ${isLightbox ? 'max-w-[300px]' : 'max-w-[200px]'}`} style={{ borderColor: styles.accentColor }}>
              <img
                src={imageUrl}
                alt="Faculty"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {/* QR Code for Publication Link */}
          {metadata?.publicationLink && (
            <div className="flex flex-col items-center">
              <div className="bg-white p-1 rounded">
                <QRCodeSVG
                  value={metadata.publicationLink}
                  size={isLightbox ? 100 : 60}
                  level="L"
                />
              </div>
              <span className={`${isLightbox ? 'text-sm' : 'text-xs'} mt-1 opacity-70`} style={{ color: styles.textColor }}>
                Scan for more
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="w-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Preview</h3>
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="View fullscreen"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
        </div>

        {/* Preview Container - 16:9 aspect ratio */}
        <div className="w-full relative" style={{ paddingBottom: '56.25%' }}>
          {renderSlideContent(false)}
        </div>

        {/* Template Info */}
        <p className="text-xs text-gray-500 mt-2">
          Live preview of your slide with the selected template and uploaded image.
        </p>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 md:p-8"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            title="Close fullscreen"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Lightbox Preview - 16:9 aspect ratio, max width */}
          <div
            className="w-full max-w-[80vw] relative"
            style={{ aspectRatio: '16/9', maxHeight: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {renderSlideContent(true)}
          </div>
        </div>
      )}
    </>
  )
}

export default SlidePreview
