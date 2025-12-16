import { EventDetails, QRCodeSection } from './shared'

/**
 * FullHeroLayout - Large background image with text overlay at bottom
 * Used for: full_hero layout type, imagePosition === 'full'
 */
function FullHeroLayout({ metadata, imageUrl, styles, isLightbox = false, isExport = false, sizes = null }) {
  // Export mode with pixel-based styles
  if (isExport && sizes) {
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', background: styles.background, position: 'relative' }}>
        {imageUrl && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <img src={imageUrl} alt="Slide background" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.4) 50%, transparent)' }} />
          </div>
        )}
        <div style={{ position: 'relative', height: '100%', padding: sizes.paddingLarge, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', color: styles.textColor }}>
          {metadata?.caption && (
            <div style={{ fontSize: sizes.caption, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>{metadata.caption}</div>
          )}
          {metadata?.headline && (
            <h1 style={{ fontSize: sizes.headlineXL, fontWeight: 'bold', lineHeight: 1.1, marginBottom: '20px' }}>{metadata.headline}</h1>
          )}
          {metadata?.description && (
            <p style={{ fontSize: sizes.bodyLG, opacity: 0.9, maxWidth: '1200px', marginBottom: '32px' }}>{metadata.description}</p>
          )}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto' }}>
            <div>
              {metadata?.authorName && (
                <div style={{ fontSize: sizes.bodyLG, marginBottom: '8px' }}>
                  <span style={{ color: styles.accentColor, fontWeight: 600 }}>{metadata.authorName}</span>
                </div>
              )}
              <div style={{ fontSize: sizes.bodySM, opacity: 0.6 }}>Columbia Business School</div>
            </div>
            <QRCodeSection publicationLink={metadata?.publicationLink} textColor={styles.textColor} isExport sizes={sizes} />
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
      {imageUrl && (
        <div className="absolute inset-0">
          <img src={imageUrl} alt="Slide background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
      )}
      <div className={`relative h-full ${isLightbox ? 'p-12 md:p-16' : 'p-6 md:p-8'} flex flex-col justify-end`} style={{ color: styles.textColor }}>
        {metadata?.caption && (
          <div className={`${isLightbox ? 'text-sm md:text-base' : 'text-xs'} opacity-80 uppercase tracking-wide mb-2`}>
            {metadata.caption}
          </div>
        )}
        {metadata?.headline && (
          <h1 className={`${isLightbox ? 'text-3xl md:text-4xl lg:text-5xl' : 'text-xl md:text-2xl lg:text-3xl'} font-bold leading-tight mb-3`}>
            {metadata.headline}
          </h1>
        )}
        {metadata?.description && (
          <p className={`${isLightbox ? 'text-base md:text-lg' : 'text-xs md:text-sm'} opacity-90 ${isLightbox ? 'max-w-3xl' : 'line-clamp-3 max-w-xl'} mb-4`}>
            {metadata.description}
          </p>
        )}
        <div className="flex items-end justify-between mt-auto">
          <div>
            {metadata?.authorName && (
              <div className={`${isLightbox ? 'text-base md:text-lg' : 'text-xs md:text-sm'} mb-1`}>
                <span style={{ color: styles.accentColor }} className="font-semibold">{metadata.authorName}</span>
              </div>
            )}
            <div className={`${isLightbox ? 'text-sm' : 'text-xs'} opacity-60`}>Columbia Business School</div>
          </div>
          <QRCodeSection publicationLink={metadata?.publicationLink} textColor={styles.textColor} isLightbox={isLightbox} />
        </div>
      </div>
    </div>
  )
}

export default FullHeroLayout
