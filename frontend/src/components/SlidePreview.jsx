import { useState, useEffect } from 'react'
import {
  FullHeroLayout,
  SplitTextPrimaryLayout,
  SplitImagePrimaryLayout,
  CircularLayout,
  NoImageLayout,
  MediaVerticalLayout,
  MediaWideLayout,
  CongratsFramedLayout,
  PodcastLayout
} from './layouts'

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
  const isNoImage = styles.imagePosition === 'none'

  // Main render function that selects the appropriate layout
  const renderSlideContent = (isLightbox = false) => {
    const layoutProps = { metadata, imageUrl, styles, isLightbox }

    // Select layout based on template style
    if (isFullHeroLayout) {
      return <FullHeroLayout {...layoutProps} />
    }
    if (isNoImage) {
      return <NoImageLayout {...layoutProps} />
    }
    if (isCircularImage) {
      return <CircularLayout {...layoutProps} />
    }
    if (isImageLeft) {
      // Check for specific layout types
      if (styles.layoutType === 'media_wide') {
        return <MediaWideLayout {...layoutProps} />
      }
      if (styles.layoutType === 'podcast_standard' || styles.layoutType === 'podcast_feature') {
        return <PodcastLayout {...layoutProps} />
      }
      return <SplitImagePrimaryLayout {...layoutProps} />
    }
    if (styles.layoutType === 'media_vertical') {
      return <MediaVerticalLayout {...layoutProps} />
    }
    if (styles.layoutType === 'congrats_framed') {
      return <CongratsFramedLayout {...layoutProps} />
    }
    // Default: Split Text Primary layout
    return <SplitTextPrimaryLayout {...layoutProps} />
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
