import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'

function SlidePreview({ metadata, template, templateStyle }) {
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

  // Get template-specific styles - now uses templateStyle prop if available
  const getTemplateStyles = () => {
    // If we have a templateStyle from the API, use it
    if (templateStyle) {
      return {
        background: `linear-gradient(135deg, ${templateStyle.background_color} 0%, ${templateStyle.background_color.replace('#', '#')} 100%)`,
        textColor: templateStyle.text_color,
        accentColor: templateStyle.accent_color,
        layoutType: templateStyle.layout_type,
        imagePosition: templateStyle.image_position,
        imageSize: templateStyle.image_size,
        textAlignment: templateStyle.text_alignment
      }
    }

    // Fallback to legacy templates
    switch (template) {
      case 'template1': // Default CBS Blue
        return {
          background: 'linear-gradient(135deg, #003DA5 0%, #0052CC 100%)',
          textColor: 'white',
          accentColor: '#009bdb',
          layoutType: 'split_text_primary',
          imagePosition: 'right',
          imageSize: 'medium',
          textAlignment: 'left'
        }
      case 'template2': // Dark Theme
        return {
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          textColor: 'white',
          accentColor: '#009bdb',
          layoutType: 'split_text_primary',
          imagePosition: 'right',
          imageSize: 'medium',
          textAlignment: 'left'
        }
      case 'template3': // Light Theme
        return {
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          textColor: '#181a1c',
          accentColor: '#003DA5',
          layoutType: 'split_text_primary',
          imagePosition: 'right',
          imageSize: 'medium',
          textAlignment: 'left'
        }
      default:
        return {
          background: 'linear-gradient(135deg, #003DA5 0%, #0052CC 100%)',
          textColor: 'white',
          accentColor: '#009bdb',
          layoutType: 'split_text_primary',
          imagePosition: 'right',
          imageSize: 'medium',
          textAlignment: 'left'
        }
    }
  }

  const styles = getTemplateStyles()

  // Determine layout based on templateStyle
  const isFullHeroLayout = styles.layoutType === 'full_hero' || styles.imagePosition === 'full'
  const isImageLeft = styles.imagePosition === 'left'
  const isCircularImage = styles.imagePosition === 'circular' || styles.imagePosition === 'center'
  const isCenteredText = styles.textAlignment === 'center'
  const isNoImage = styles.imagePosition === 'none'

  // Render event details section (reusable)
  const renderEventDetails = (isLightbox) => {
    if (!(metadata?.eventDate || metadata?.event_date || metadata?.eventTime || metadata?.event_time || metadata?.eventLocation || metadata?.event_location)) {
      return null
    }
    return (
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
    )
  }

  // Render QR code section (reusable)
  const renderQRCode = (isLightbox) => {
    if (!metadata?.publicationLink) return null
    return (
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
    )
  }

  // Layout: Full Hero - Large background image with text overlay
  const renderFullHeroLayout = (isLightbox) => (
    <div
      className={`${isLightbox ? 'w-full h-full' : 'absolute inset-0'} rounded-lg overflow-hidden shadow-lg`}
      style={{ background: styles.background }}
    >
      {/* Full Background Image */}
      {imageUrl && (
        <div className="absolute inset-0">
          <img
            src={imageUrl}
            alt="Slide background"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
          />
        </div>
      )}

      {/* Content Overlay - Bottom aligned */}
      <div className={`relative h-full ${isLightbox ? 'p-12 md:p-16' : 'p-6 md:p-8'} flex flex-col justify-end`} style={{ color: styles.textColor }}>
        {/* Caption */}
        {metadata?.caption && (
          <div className={`${isLightbox ? 'text-sm md:text-base' : 'text-xs'} opacity-80 uppercase tracking-wide mb-2`}>
            {metadata.caption}
          </div>
        )}

        {/* Headline */}
        {metadata?.headline && (
          <h1 className={`${isLightbox ? 'text-3xl md:text-4xl lg:text-5xl' : 'text-xl md:text-2xl lg:text-3xl'} font-bold leading-tight mb-3`}>
            {metadata.headline}
          </h1>
        )}

        {/* Description */}
        {metadata?.description && (
          <p className={`${isLightbox ? 'text-base md:text-lg' : 'text-xs md:text-sm'} opacity-90 ${isLightbox ? 'max-w-3xl' : 'line-clamp-3 max-w-xl'} mb-4`}>
            {metadata.description}
          </p>
        )}

        {/* Bottom row - Author and QR */}
        <div className="flex items-end justify-between mt-auto">
          <div>
            {metadata?.authorName && (
              <div className={`${isLightbox ? 'text-base md:text-lg' : 'text-xs md:text-sm'} mb-1`}>
                <span style={{ color: styles.accentColor }} className="font-semibold">
                  {metadata.authorName}
                </span>
              </div>
            )}
            <div className={`${isLightbox ? 'text-sm' : 'text-xs'} opacity-60`}>
              Columbia Business School
            </div>
          </div>
          {renderQRCode(isLightbox)}
        </div>
      </div>
    </div>
  )

  // Layout: Split Text Primary - Text on left (2/3), image on right (1/3)
  const renderSplitTextPrimaryLayout = (isLightbox) => (
    <div
      className={`${isLightbox ? 'w-full h-full' : 'absolute inset-0'} rounded-lg overflow-hidden shadow-lg`}
      style={{ background: styles.background }}
    >
      {/* Subtle background image overlay */}
      {imageUrl && (
        <div className="absolute inset-0">
          <img
            src={imageUrl}
            alt="Slide background"
            className="w-full h-full object-cover opacity-10"
          />
          <div
            className="absolute inset-0"
            style={{ background: styles.background, opacity: 0.9 }}
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

            {renderEventDetails(isLightbox)}
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
            <div className={`${isLightbox ? 'text-sm' : 'text-xs'} opacity-60`}>
              Columbia Business School
            </div>
          </div>
        </div>

        {/* Right Side - Circular Image and QR Code (1/3) */}
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
          {renderQRCode(isLightbox)}
        </div>
      </div>
    </div>
  )

  // Layout: Split Image Primary - Large image on left, text on right
  const renderSplitImagePrimaryLayout = (isLightbox) => (
    <div
      className={`${isLightbox ? 'w-full h-full' : 'absolute inset-0'} rounded-lg overflow-hidden shadow-lg flex`}
      style={{ background: styles.background }}
    >
      {/* Left Side - Large Image (1/2) */}
      <div className="w-1/2 relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Featured"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${styles.accentColor}40, ${styles.accentColor}20)` }} />
        )}
      </div>

      {/* Right Side - Text Content (1/2) */}
      <div className={`w-1/2 ${isLightbox ? 'p-10 md:p-14' : 'p-5 md:p-6'} flex flex-col justify-between`} style={{ color: styles.textColor }}>
        {/* Top Section - Caption */}
        {metadata?.caption && (
          <div className={`${isLightbox ? 'text-sm md:text-base' : 'text-xs'} opacity-80 uppercase tracking-wide`}>
            {metadata.caption}
          </div>
        )}

        {/* Middle Section - Headline & Description */}
        <div className="flex-1 flex flex-col justify-center space-y-3">
          {metadata?.headline && (
            <h1 className={`${isLightbox ? 'text-2xl md:text-3xl lg:text-4xl' : 'text-lg md:text-xl lg:text-2xl'} font-bold leading-tight`}>
              {metadata.headline}
            </h1>
          )}

          {metadata?.description && (
            <p className={`${isLightbox ? 'text-sm md:text-base' : 'text-xs'} opacity-90 ${isLightbox ? '' : 'line-clamp-4'}`}>
              {metadata.description}
            </p>
          )}

          {renderEventDetails(isLightbox)}
        </div>

        {/* Bottom Section */}
        <div className="flex items-end justify-between">
          <div>
            {metadata?.authorName && (
              <div className={`${isLightbox ? 'text-base md:text-lg' : 'text-xs md:text-sm'} mb-1`}>
                <span style={{ color: styles.accentColor }} className="font-semibold">
                  {metadata.authorName}
                </span>
              </div>
            )}
            <div className={`${isLightbox ? 'text-sm' : 'text-xs'} opacity-60`}>
              Columbia Business School
            </div>
          </div>
          {renderQRCode(isLightbox)}
        </div>
      </div>
    </div>
  )

  // Layout: Circular/Speaker - Centered circular image with text below
  const renderCircularLayout = (isLightbox) => (
    <div
      className={`${isLightbox ? 'w-full h-full' : 'absolute inset-0'} rounded-lg overflow-hidden shadow-lg`}
      style={{ background: styles.background }}
    >
      {/* Content Container - Centered */}
      <div className={`relative h-full ${isLightbox ? 'p-10 md:p-14' : 'p-5 md:p-6'} flex flex-col items-center justify-center text-center`} style={{ color: styles.textColor }}>
        {/* Caption */}
        {metadata?.caption && (
          <div className={`${isLightbox ? 'text-sm md:text-base' : 'text-xs'} opacity-80 uppercase tracking-wide mb-3`}>
            {metadata.caption}
          </div>
        )}

        {/* Circular Image */}
        {imageUrl && (
          <div className={`aspect-square rounded-full overflow-hidden border-4 shadow-xl mb-4 ${isLightbox ? 'w-48 md:w-56' : 'w-28 md:w-36'}`} style={{ borderColor: styles.accentColor }}>
            <img
              src={imageUrl}
              alt="Speaker"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Author Name - Prominent */}
        {metadata?.authorName && (
          <div className={`${isLightbox ? 'text-xl md:text-2xl' : 'text-sm md:text-base'} font-bold mb-2`} style={{ color: styles.accentColor }}>
            {metadata.authorName}
          </div>
        )}

        {/* Headline */}
        {metadata?.headline && (
          <h1 className={`${isLightbox ? 'text-2xl md:text-3xl' : 'text-base md:text-lg'} font-bold leading-tight mb-2`}>
            {metadata.headline}
          </h1>
        )}

        {/* Description */}
        {metadata?.description && (
          <p className={`${isLightbox ? 'text-sm md:text-base max-w-2xl' : 'text-xs max-w-md line-clamp-3'} opacity-90 mb-3`}>
            {metadata.description}
          </p>
        )}

        {/* Event Details */}
        <div className="mb-3">
          {renderEventDetails(isLightbox)}
        </div>

        {/* QR Code and CBS Logo */}
        <div className="flex items-center gap-6 mt-auto">
          {renderQRCode(isLightbox)}
          <div className={`${isLightbox ? 'text-sm' : 'text-xs'} opacity-60`}>
            Columbia Business School
          </div>
        </div>
      </div>
    </div>
  )

  // Layout: No Image - Text-only bold layout
  const renderNoImageLayout = (isLightbox) => (
    <div
      className={`${isLightbox ? 'w-full h-full' : 'absolute inset-0'} rounded-lg overflow-hidden shadow-lg`}
      style={{ background: styles.background }}
    >
      {/* Content Container - Centered text */}
      <div className={`relative h-full ${isLightbox ? 'p-12 md:p-16' : 'p-6 md:p-8'} flex flex-col items-center justify-center text-center`} style={{ color: styles.textColor }}>
        {/* Caption */}
        {metadata?.caption && (
          <div className={`${isLightbox ? 'text-base md:text-lg' : 'text-sm'} opacity-80 uppercase tracking-widest mb-4`}>
            {metadata.caption}
          </div>
        )}

        {/* Large Headline */}
        {metadata?.headline && (
          <h1 className={`${isLightbox ? 'text-4xl md:text-5xl lg:text-6xl' : 'text-2xl md:text-3xl'} font-bold leading-tight mb-4 max-w-4xl`}>
            {metadata.headline}
          </h1>
        )}

        {/* Description */}
        {metadata?.description && (
          <p className={`${isLightbox ? 'text-lg md:text-xl max-w-3xl' : 'text-sm max-w-lg line-clamp-4'} opacity-90 mb-6`}>
            {metadata.description}
          </p>
        )}

        {/* Event Details */}
        <div className="mb-4">
          {renderEventDetails(isLightbox)}
        </div>

        {/* Bottom row */}
        <div className="flex items-center gap-6 mt-auto">
          {metadata?.authorName && (
            <div className={`${isLightbox ? 'text-base md:text-lg' : 'text-xs md:text-sm'}`}>
              <span style={{ color: styles.accentColor }} className="font-semibold">
                {metadata.authorName}
              </span>
            </div>
          )}
          {renderQRCode(isLightbox)}
          <div className={`${isLightbox ? 'text-sm' : 'text-xs'} opacity-60`}>
            Columbia Business School
          </div>
        </div>
      </div>
    </div>
  )

  // Layout: Media Vertical - Article preview with image on top
  const renderMediaVerticalLayout = (isLightbox) => (
    <div
      className={`${isLightbox ? 'w-full h-full' : 'absolute inset-0'} rounded-lg overflow-hidden shadow-lg`}
      style={{ background: styles.background }}
    >
      {/* Content Container */}
      <div className={`relative h-full ${isLightbox ? 'p-10 md:p-12' : 'p-5 md:p-6'} flex gap-6`} style={{ color: styles.textColor }}>
        {/* Left Side - Article Card */}
        <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
          {/* Top Image */}
          {imageUrl && (
            <div className="h-2/5 overflow-hidden">
              <img
                src={imageUrl}
                alt="Article"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {/* Article Content */}
          <div className={`flex-1 ${isLightbox ? 'p-6' : 'p-3'} flex flex-col`} style={{ color: '#181a1c' }}>
            {metadata?.caption && (
              <div className={`${isLightbox ? 'text-xs' : 'text-[10px]'} opacity-60 uppercase tracking-wide mb-1`}>
                {metadata.caption}
              </div>
            )}
            {metadata?.headline && (
              <h2 className={`${isLightbox ? 'text-xl md:text-2xl' : 'text-sm md:text-base'} font-bold leading-tight mb-2`}>
                {metadata.headline}
              </h2>
            )}
            {metadata?.description && (
              <p className={`${isLightbox ? 'text-sm' : 'text-xs'} opacity-80 ${isLightbox ? '' : 'line-clamp-3'} flex-1`}>
                {metadata.description}
              </p>
            )}
          </div>
        </div>

        {/* Right Side - Featured Info */}
        <div className="w-1/3 flex flex-col justify-between">
          <div>
            {metadata?.authorName && (
              <div className={`${isLightbox ? 'text-lg md:text-xl' : 'text-sm'} font-semibold mb-2`} style={{ color: styles.accentColor }}>
                Featured: {metadata.authorName}
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-3">
            {renderQRCode(isLightbox)}
            <div className={`${isLightbox ? 'text-sm' : 'text-xs'} opacity-60 text-center`}>
              Columbia Business School
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Layout: Media Wide - Horizontal article preview
  const renderMediaWideLayout = (isLightbox) => (
    <div
      className={`${isLightbox ? 'w-full h-full' : 'absolute inset-0'} rounded-lg overflow-hidden shadow-lg flex`}
      style={{ background: styles.background }}
    >
      {/* Left Side - Large Image */}
      <div className="w-2/5 relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Article"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>

      {/* Right Side - Content */}
      <div className={`flex-1 ${isLightbox ? 'p-10 md:p-12' : 'p-5 md:p-6'} flex flex-col justify-between`} style={{ color: styles.textColor }}>
        {/* Top */}
        <div>
          {metadata?.caption && (
            <div className={`${isLightbox ? 'text-sm' : 'text-xs'} opacity-60 uppercase tracking-wide mb-2`} style={{ color: styles.accentColor }}>
              {metadata.caption}
            </div>
          )}
          {metadata?.headline && (
            <h1 className={`${isLightbox ? 'text-2xl md:text-3xl' : 'text-base md:text-lg'} font-bold leading-tight mb-3`}>
              {metadata.headline}
            </h1>
          )}
          {metadata?.description && (
            <p className={`${isLightbox ? 'text-sm md:text-base' : 'text-xs'} opacity-80 ${isLightbox ? '' : 'line-clamp-4'}`}>
              {metadata.description}
            </p>
          )}
        </div>

        {/* Bottom */}
        <div className="flex items-end justify-between">
          <div>
            {metadata?.authorName && (
              <div className={`${isLightbox ? 'text-base' : 'text-xs'} mb-1`}>
                <span style={{ color: styles.accentColor }} className="font-semibold">
                  {metadata.authorName}
                </span>
              </div>
            )}
            <div className={`${isLightbox ? 'text-sm' : 'text-xs'} opacity-60`}>
              Columbia Business School
            </div>
          </div>
          {renderQRCode(isLightbox)}
        </div>
      </div>
    </div>
  )

  // Layout: Congrats Framed - Centered framed image
  const renderCongratsFramedLayout = (isLightbox) => (
    <div
      className={`${isLightbox ? 'w-full h-full' : 'absolute inset-0'} rounded-lg overflow-hidden shadow-lg`}
      style={{ background: styles.background }}
    >
      {/* Content Container */}
      <div className={`relative h-full ${isLightbox ? 'p-8 md:p-12' : 'p-4 md:p-6'} flex`} style={{ color: styles.textColor }}>
        {/* Left Side - Framed Image */}
        <div className="w-2/5 flex items-center justify-center">
          <div className={`relative ${isLightbox ? 'p-3' : 'p-2'}`} style={{ border: `4px solid ${styles.accentColor}`, borderRadius: '8px' }}>
            {/* Decorative corner accents */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: styles.accentColor }} />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: styles.accentColor }} />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: styles.accentColor }} />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: styles.accentColor }} />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Honoree"
                className={`${isLightbox ? 'max-h-64' : 'max-h-40'} object-cover rounded`}
              />
            )}
          </div>
        </div>

        {/* Right Side - Content */}
        <div className="flex-1 flex flex-col justify-center pl-6">
          {metadata?.caption && (
            <div className={`${isLightbox ? 'text-lg md:text-xl' : 'text-sm'} uppercase tracking-widest mb-2`} style={{ color: styles.accentColor }}>
              {metadata.caption || 'Congratulations'}
            </div>
          )}
          {metadata?.authorName && (
            <h1 className={`${isLightbox ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'} font-bold leading-tight mb-3`}>
              {metadata.authorName}
            </h1>
          )}
          {metadata?.headline && (
            <h2 className={`${isLightbox ? 'text-xl md:text-2xl' : 'text-base'} font-semibold mb-2`} style={{ color: styles.accentColor }}>
              {metadata.headline}
            </h2>
          )}
          {metadata?.description && (
            <p className={`${isLightbox ? 'text-base' : 'text-xs'} opacity-90 ${isLightbox ? '' : 'line-clamp-3'}`}>
              {metadata.description}
            </p>
          )}
          <div className={`${isLightbox ? 'text-sm mt-6' : 'text-xs mt-3'} opacity-60`}>
            Columbia Business School
          </div>
        </div>
      </div>
    </div>
  )

  // Layout: Podcast - Artwork on left with episode info
  const renderPodcastLayout = (isLightbox) => (
    <div
      className={`${isLightbox ? 'w-full h-full' : 'absolute inset-0'} rounded-lg overflow-hidden shadow-lg flex`}
      style={{ background: styles.background }}
    >
      {/* Left Side - Podcast Artwork */}
      <div className={`w-2/5 ${isLightbox ? 'p-8' : 'p-4'} flex items-center justify-center`}>
        {imageUrl ? (
          <div className="w-full aspect-square rounded-lg overflow-hidden shadow-2xl">
            <img
              src={imageUrl}
              alt="Podcast Artwork"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <svg className={`${isLightbox ? 'w-20 h-20' : 'w-12 h-12'} opacity-50`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93h2c0 2.76 2.24 5 5 5s5-2.24 5-5h2c0 4.08-3.06 7.44-7 7.93V19h4v2H8v-2h4v-3.07z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Right Side - Episode Info */}
      <div className={`flex-1 ${isLightbox ? 'p-8 md:p-10' : 'p-4 md:p-5'} flex flex-col justify-between`} style={{ color: styles.textColor }}>
        <div>
          {metadata?.caption && (
            <div className={`${isLightbox ? 'text-sm' : 'text-xs'} opacity-60 uppercase tracking-wide mb-2`}>
              {metadata.caption || 'Podcast Episode'}
            </div>
          )}
          {metadata?.headline && (
            <h1 className={`${isLightbox ? 'text-2xl md:text-3xl' : 'text-base md:text-lg'} font-bold leading-tight mb-3`}>
              {metadata.headline}
            </h1>
          )}
          {metadata?.description && (
            <p className={`${isLightbox ? 'text-sm md:text-base' : 'text-xs'} opacity-80 ${isLightbox ? '' : 'line-clamp-4'}`}>
              {metadata.description}
            </p>
          )}
        </div>

        {/* Bottom */}
        <div className="flex items-end justify-between">
          <div>
            {metadata?.authorName && (
              <div className={`${isLightbox ? 'text-base' : 'text-xs'} mb-1`}>
                <span className="opacity-60">Host: </span>
                <span style={{ color: styles.accentColor }} className="font-semibold">
                  {metadata.authorName}
                </span>
              </div>
            )}
            <div className={`${isLightbox ? 'text-sm' : 'text-xs'} opacity-60`}>
              Columbia Business School
            </div>
          </div>
          {renderQRCode(isLightbox)}
        </div>
      </div>
    </div>
  )

  // Main render function that selects the appropriate layout
  const renderSlideContent = (isLightbox = false) => {
    // Select layout based on template style
    if (isFullHeroLayout) {
      return renderFullHeroLayout(isLightbox)
    }
    if (isNoImage) {
      return renderNoImageLayout(isLightbox)
    }
    if (isCircularImage) {
      return renderCircularLayout(isLightbox)
    }
    if (isImageLeft) {
      // Check for specific layout types
      if (styles.layoutType === 'media_wide') {
        return renderMediaWideLayout(isLightbox)
      }
      if (styles.layoutType === 'podcast_standard' || styles.layoutType === 'podcast_feature') {
        return renderPodcastLayout(isLightbox)
      }
      return renderSplitImagePrimaryLayout(isLightbox)
    }
    if (styles.layoutType === 'media_vertical') {
      return renderMediaVerticalLayout(isLightbox)
    }
    if (styles.layoutType === 'congrats_framed') {
      return renderCongratsFramedLayout(isLightbox)
    }
    // Default: Split Text Primary layout
    return renderSplitTextPrimaryLayout(isLightbox)
  }

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
