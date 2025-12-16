import { EventDetails, QRCodeSection } from './shared'

/**
 * SplitTextPrimaryLayout - Text on left (2/3), circular image on right (1/3)
 * Default layout for most slide types
 */
function SplitTextPrimaryLayout({ metadata, imageUrl, styles, isLightbox = false, isExport = false, sizes = null }) {
  // Export mode with pixel-based styles
  if (isExport && sizes) {
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', background: styles.background, position: 'relative' }}>
        {imageUrl && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <img src={imageUrl} alt="Slide background" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.1 }} />
            <div style={{ position: 'absolute', inset: 0, background: styles.background, opacity: 0.9 }} />
          </div>
        )}
        <div style={{ position: 'relative', height: '100%', padding: sizes.paddingLarge, display: 'flex' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: '32px', color: styles.textColor }}>
            {metadata?.caption && (
              <div style={{ fontSize: sizes.caption, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '2px' }}>{metadata.caption}</div>
            )}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '24px' }}>
              {metadata?.headline && (
                <h1 style={{ fontSize: sizes.headlineXL, fontWeight: 'bold', lineHeight: 1.1 }}>{metadata.headline}</h1>
              )}
              {metadata?.description && (
                <p style={{ fontSize: sizes.bodyLG, opacity: 0.9 }}>{metadata.description}</p>
              )}
              <EventDetails metadata={metadata} isExport sizes={sizes} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {metadata?.authorName && (
                <div style={{ fontSize: sizes.bodyLG }}>
                  <span style={{ color: styles.accentColor, fontWeight: 600 }}>{metadata.authorName}</span>
                </div>
              )}
              <div style={{ fontSize: sizes.bodySM, opacity: 0.6 }}>Columbia Business School</div>
            </div>
          </div>
          <div style={{ width: '33%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
            {imageUrl && (
              <div style={{ width: '100%', maxWidth: sizes.circleImageSize, aspectRatio: '1', borderRadius: '50%', overflow: 'hidden', border: `${sizes.borderWidth} solid ${styles.accentColor}`, boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
                <img src={imageUrl} alt="Faculty" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
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
          <img src={imageUrl} alt="Slide background" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0" style={{ background: styles.background, opacity: 0.9 }} />
        </div>
      )}
      <div className={`relative h-full ${isLightbox ? 'p-12 md:p-16' : 'p-6 md:p-8'} flex`}>
        <div className="flex-1 flex flex-col justify-between pr-4" style={{ color: styles.textColor }}>
          {metadata?.caption && (
            <div className={`${isLightbox ? 'text-sm md:text-base' : 'text-xs'} opacity-80 uppercase tracking-wide`}>
              {metadata.caption}
            </div>
          )}
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
            <EventDetails metadata={metadata} isLightbox={isLightbox} />
          </div>
          <div className="flex items-center justify-between">
            {metadata?.authorName && (
              <div className={`${isLightbox ? 'text-base md:text-lg' : 'text-xs md:text-sm'}`}>
                <span style={{ color: styles.accentColor }} className="font-semibold">{metadata.authorName}</span>
              </div>
            )}
            <div className={`${isLightbox ? 'text-sm' : 'text-xs'} opacity-60`}>Columbia Business School</div>
          </div>
        </div>
        <div className="w-1/3 flex flex-col items-center justify-center gap-3">
          {imageUrl && (
            <div className={`w-full aspect-square rounded-full overflow-hidden border-4 shadow-lg ${isLightbox ? 'max-w-[300px]' : 'max-w-[200px]'}`} style={{ borderColor: styles.accentColor }}>
              <img src={imageUrl} alt="Faculty" className="w-full h-full object-cover" />
            </div>
          )}
          <QRCodeSection publicationLink={metadata?.publicationLink} textColor={styles.textColor} isLightbox={isLightbox} />
        </div>
      </div>
    </div>
  )
}

export default SplitTextPrimaryLayout
