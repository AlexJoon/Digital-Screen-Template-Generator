/**
 * CongratsFramedLayout - Centered framed image with decorative corners
 * Used for: congratulations, awards, layout_type === 'congrats_framed'
 */
function CongratsFramedLayout({ metadata, imageUrl, styles, isLightbox = false, isExport = false, sizes = null }) {
  // Export mode with pixel-based styles
  if (isExport && sizes) {
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', background: styles.background }}>
        <div style={{ position: 'relative', height: '100%', padding: sizes.paddingMedium, display: 'flex', color: styles.textColor }}>
          {/* Left Side - Framed Image */}
          <div style={{ width: '40%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', padding: '20px', border: `6px solid ${styles.accentColor}`, borderRadius: '12px' }}>
              {/* Decorative corner accents */}
              <div style={{ position: 'absolute', top: '-4px', left: '-4px', width: '24px', height: '24px', borderTop: `3px solid ${styles.accentColor}`, borderLeft: `3px solid ${styles.accentColor}` }} />
              <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '24px', height: '24px', borderTop: `3px solid ${styles.accentColor}`, borderRight: `3px solid ${styles.accentColor}` }} />
              <div style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: '24px', height: '24px', borderBottom: `3px solid ${styles.accentColor}`, borderLeft: `3px solid ${styles.accentColor}` }} />
              <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '24px', height: '24px', borderBottom: `3px solid ${styles.accentColor}`, borderRight: `3px solid ${styles.accentColor}` }} />
              {imageUrl && (
                <img src={imageUrl} alt="Honoree" style={{ maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' }} />
              )}
            </div>
          </div>

          {/* Right Side - Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '48px' }}>
            {metadata?.caption && (
              <div style={{ fontSize: sizes.headlineMD, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '16px', color: styles.accentColor }}>
                {metadata.caption || 'Congratulations'}
              </div>
            )}
            {metadata?.authorName && (
              <h1 style={{ fontSize: sizes.headlineXL, fontWeight: 'bold', lineHeight: 1.1, marginBottom: '24px' }}>{metadata.authorName}</h1>
            )}
            {metadata?.headline && (
              <h2 style={{ fontSize: sizes.headlineLG, fontWeight: 600, marginBottom: '16px', color: styles.accentColor }}>{metadata.headline}</h2>
            )}
            {metadata?.description && (
              <p style={{ fontSize: sizes.bodyMD, opacity: 0.9 }}>{metadata.description}</p>
            )}
            <div style={{ fontSize: sizes.bodySM, marginTop: '48px', opacity: 0.6 }}>Columbia Business School</div>
          </div>
        </div>
      </div>
    )
  }

  // Preview mode with Tailwind classes
  return (
    <div
      className={`${isLightbox ? 'w-full h-full' : 'absolute inset-0'} rounded-lg overflow-hidden shadow-lg`}
      style={{ background: styles.background }}
    >
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
              <img src={imageUrl} alt="Honoree" className={`${isLightbox ? 'max-h-64' : 'max-h-40'} object-cover rounded`} />
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
}

export default CongratsFramedLayout
