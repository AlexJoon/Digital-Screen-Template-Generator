import { EventDetails, QRCodeSection } from './shared'

/**
 * CircularLayout - Centered circular image with text below
 * Used for: speaker layouts, image_position === 'circular' or 'center'
 */
function CircularLayout({ metadata, imageUrl, styles, isLightbox = false, isExport = false, sizes = null }) {
  // Export mode with pixel-based styles
  if (isExport && sizes) {
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', background: styles.background }}>
        <div style={{ position: 'relative', height: '100%', padding: sizes.paddingMedium, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: styles.textColor }}>
          {metadata?.caption && (
            <div style={{ fontSize: sizes.caption, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px' }}>{metadata.caption}</div>
          )}
          {imageUrl && (
            <div style={{ width: '320px', height: '320px', borderRadius: '50%', overflow: 'hidden', border: `${sizes.borderWidth} solid ${styles.accentColor}`, boxShadow: '0 10px 40px rgba(0,0,0,0.3)', marginBottom: '32px' }}>
              <img src={imageUrl} alt="Speaker" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          {metadata?.authorName && (
            <div style={{ fontSize: sizes.headlineMD, fontWeight: 'bold', marginBottom: '16px', color: styles.accentColor }}>{metadata.authorName}</div>
          )}
          {metadata?.headline && (
            <h1 style={{ fontSize: sizes.headlineMD, fontWeight: 'bold', lineHeight: 1.1, marginBottom: '16px' }}>{metadata.headline}</h1>
          )}
          {metadata?.description && (
            <p style={{ fontSize: sizes.bodyMD, opacity: 0.9, maxWidth: '900px', marginBottom: '24px' }}>{metadata.description}</p>
          )}
          <div style={{ marginBottom: '24px' }}>
            <EventDetails metadata={metadata} isExport sizes={sizes} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '48px', marginTop: 'auto' }}>
            <QRCodeSection publicationLink={metadata?.publicationLink} textColor={styles.textColor} isExport sizes={sizes} />
            <div style={{ fontSize: sizes.bodySM, opacity: 0.6 }}>Columbia Business School</div>
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
      <div className={`relative h-full ${isLightbox ? 'p-10 md:p-14' : 'p-5 md:p-6'} flex flex-col items-center justify-center text-center`} style={{ color: styles.textColor }}>
        {metadata?.caption && (
          <div className={`${isLightbox ? 'text-sm md:text-base' : 'text-xs'} opacity-80 uppercase tracking-wide mb-3`}>
            {metadata.caption}
          </div>
        )}
        {imageUrl && (
          <div className={`aspect-square rounded-full overflow-hidden border-4 shadow-xl mb-4 ${isLightbox ? 'w-48 md:w-56' : 'w-28 md:w-36'}`} style={{ borderColor: styles.accentColor }}>
            <img src={imageUrl} alt="Speaker" className="w-full h-full object-cover" />
          </div>
        )}
        {metadata?.authorName && (
          <div className={`${isLightbox ? 'text-xl md:text-2xl' : 'text-sm md:text-base'} font-bold mb-2`} style={{ color: styles.accentColor }}>
            {metadata.authorName}
          </div>
        )}
        {metadata?.headline && (
          <h1 className={`${isLightbox ? 'text-2xl md:text-3xl' : 'text-base md:text-lg'} font-bold leading-tight mb-2`}>
            {metadata.headline}
          </h1>
        )}
        {metadata?.description && (
          <p className={`${isLightbox ? 'text-sm md:text-base max-w-2xl' : 'text-xs max-w-md line-clamp-3'} opacity-90 mb-3`}>
            {metadata.description}
          </p>
        )}
        <div className="mb-3">
          <EventDetails metadata={metadata} isLightbox={isLightbox} />
        </div>
        <div className="flex items-center gap-6 mt-auto">
          <QRCodeSection publicationLink={metadata?.publicationLink} textColor={styles.textColor} isLightbox={isLightbox} />
          <div className={`${isLightbox ? 'text-sm' : 'text-xs'} opacity-60`}>Columbia Business School</div>
        </div>
      </div>
    </div>
  )
}

export default CircularLayout
