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

/**
 * SlideRender - Dedicated component for server-side rendering/screenshots
 * This renders the slide at exactly 1920x1080 pixels for Playwright to screenshot
 *
 * Data is passed via window.__SLIDE_DATA__ (injected by Playwright)
 *
 * IMPORTANT: All sizes are in pixels, scaled for 1920x1080 output
 */

// Size constants for 1920x1080 export (approximately 2x normal sizes)
const SIZES = {
  // Padding
  paddingLarge: '80px',
  paddingMedium: '60px',
  paddingSmall: '40px',

  // Font sizes
  headlineXL: '72px',
  headlineLG: '60px',
  headlineMD: '48px',
  bodyLG: '28px',
  bodyMD: '24px',
  bodySM: '20px',
  caption: '22px',
  small: '18px',

  // Spacing
  gap: '24px',
  gapLarge: '40px',

  // Elements
  qrSize: 140,
  circleImageSize: '400px',
  borderWidth: '6px',
}

function SlideRender() {
  const [slideData, setSlideData] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [ready, setReady] = useState(false)

  // Function to process slide data
  const processSlideData = (decoded) => {
    setSlideData(decoded)

    // If there's image data (base64), convert to blob URL
    if (decoded.imageData) {
      const byteCharacters = atob(decoded.imageData)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/jpeg' })
      setImageUrl(URL.createObjectURL(blob))
    }

    // Mark as ready after a short delay to ensure rendering is complete
    setTimeout(() => setReady(true), 100)
  }

  useEffect(() => {
    // Check if data is already available (injected by Playwright)
    if (window.__SLIDE_DATA__) {
      processSlideData(window.__SLIDE_DATA__)
      return
    }

    // Set up a listener for data injection
    window.__setSlideData__ = (data) => {
      processSlideData(data)
    }

    // Signal that we're ready to receive data
    window.__SLIDE_RENDER_READY__ = true

    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
      delete window.__setSlideData__
      delete window.__SLIDE_RENDER_READY__
    }
  }, [])

  if (!slideData) {
    return <div id="slide-render-status" data-status="loading">Loading...</div>
  }

  // Extract template style
  const templateStyle = slideData.templateStyle || {}
  const styles = {
    background: templateStyle.background_color
      ? `linear-gradient(135deg, ${templateStyle.background_color} 0%, ${templateStyle.background_gradient_end || templateStyle.background_color} 100%)`
      : 'linear-gradient(135deg, #003DA5 0%, #0052CC 100%)',
    textColor: templateStyle.text_color || '#FFFFFF',
    accentColor: templateStyle.accent_color || '#009bdb',
    layoutType: templateStyle.layout_type || 'split_text_primary',
    imagePosition: templateStyle.image_position || 'right',
  }

  // Determine layout
  const isFullHeroLayout = styles.layoutType === 'full_hero' || styles.imagePosition === 'full'
  const isImageLeft = styles.imagePosition === 'left'
  const isCircularImage = styles.imagePosition === 'circular' || styles.imagePosition === 'center'
  const isNoImage = styles.imagePosition === 'none'

  // Main render function that selects the appropriate layout
  const renderSlideContent = () => {
    const layoutProps = {
      metadata: slideData,
      imageUrl,
      styles,
      isExport: true,
      sizes: SIZES
    }

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
    <div
      id="slide-render-container"
      data-status={ready ? 'ready' : 'loading'}
      style={{
        position: 'relative',
        width: '1920px',
        height: '1080px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {renderSlideContent()}
    </div>
  )
}

export default SlideRender
