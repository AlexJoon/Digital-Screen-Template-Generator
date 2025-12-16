import { EventDetails, QRCodeSection } from './shared'

/**
 * SplitImagePrimaryLayout - Large image on left (1/2), text on right (1/2)
 * Used when image_position === 'left'
 */
function SplitImagePrimaryLayout({ metadata, imageUrl, styles, isLightbox = false, isExport = false, sizes = null }) {
  // Export mode with pixel-based styles
  if (isExport && sizes) {
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', background: styles.background, display: 'flex' }}>
        <div style={{ width: '50%', position: 'relative' }}>
          {imageUrl ? (
            <img src={imageUrl} alt="Featured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${styles.accentColor}40, ${styles.accentColor}20)` }} />
          )}
        </div>
        <div style={{ width: '50%', padding: sizes.paddingMedium, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: styles.textColor }}>
          {metadata?.caption && (
            <div style={{ fontSize: sizes.caption, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '2px' }}>{metadata.caption}</div>
          )}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '24px' }}>
            {metadata?.headline && (
              <h1 style={{ fontSize: sizes.headlineLG, fontWeight: 'bold', lineHeight: 1.1 }}>{metadata.headline}</h1>
            )}
            {metadata?.description && (
              <p style={{ fontSize: sizes.bodyMD, opacity: 0.9 }}>{metadata.description}</p>
            )}
            <EventDetails metadata={metadata} isExport sizes={sizes} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
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
      className={`${isLightbox ? 'w-full h-full' : 'absolute inset-0'} rounded-lg overflow-hidden shadow-lg flex`}
      style={{ background: styles.background }}
    >
      <div className="w-1/2 relative">
        {imageUrl ? (
          <img src={imageUrl} alt="Featured" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${styles.accentColor}40, ${styles.accentColor}20)` }} />
        )}
      </div>
      <div className={`w-1/2 ${isLightbox ? 'p-10 md:p-14' : 'p-5 md:p-6'} flex flex-col justify-between`} style={{ color: styles.textColor }}>
        {metadata?.caption && (
          <div className={`${isLightbox ? 'text-sm md:text-base' : 'text-xs'} opacity-80 uppercase tracking-wide`}>
            {metadata.caption}
          </div>
        )}
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
          <EventDetails metadata={metadata} isLightbox={isLightbox} />
        </div>
        <div className="flex items-end justify-between">
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

export default SplitImagePrimaryLayout
