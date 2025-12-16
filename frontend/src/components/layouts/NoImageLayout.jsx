import { EventDetails, QRCodeSection } from './shared'

/**
 * NoImageLayout - Text-only bold layout with centered content
 * Used for: text-heavy announcements, quotes, image_position === 'none'
 */
function NoImageLayout({ metadata, styles, isLightbox = false, isExport = false, sizes = null }) {
  // Export mode with pixel-based styles
  if (isExport && sizes) {
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', background: styles.background }}>
        <div style={{ position: 'relative', height: '100%', padding: sizes.paddingLarge, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: styles.textColor }}>
          {metadata?.caption && (
            <div style={{ fontSize: sizes.bodyMD, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '32px' }}>{metadata.caption}</div>
          )}
          {metadata?.headline && (
            <h1 style={{ fontSize: sizes.headlineXL, fontWeight: 'bold', lineHeight: 1.1, marginBottom: '32px', maxWidth: '1400px' }}>{metadata.headline}</h1>
          )}
          {metadata?.description && (
            <p style={{ fontSize: sizes.bodyLG, opacity: 0.9, maxWidth: '1100px', marginBottom: '40px' }}>{metadata.description}</p>
          )}
          <div style={{ marginBottom: '32px' }}>
            <EventDetails metadata={metadata} isExport sizes={sizes} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '48px', marginTop: 'auto' }}>
            {metadata?.authorName && (
              <div style={{ fontSize: sizes.bodyMD }}>
                <span style={{ color: styles.accentColor, fontWeight: 600 }}>{metadata.authorName}</span>
              </div>
            )}
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
      <div className={`relative h-full ${isLightbox ? 'p-12 md:p-16' : 'p-6 md:p-8'} flex flex-col items-center justify-center text-center`} style={{ color: styles.textColor }}>
        {metadata?.caption && (
          <div className={`${isLightbox ? 'text-base md:text-lg' : 'text-sm'} opacity-80 uppercase tracking-widest mb-4`}>
            {metadata.caption}
          </div>
        )}
        {metadata?.headline && (
          <h1 className={`${isLightbox ? 'text-4xl md:text-5xl lg:text-6xl' : 'text-2xl md:text-3xl'} font-bold leading-tight mb-4 max-w-4xl`}>
            {metadata.headline}
          </h1>
        )}
        {metadata?.description && (
          <p className={`${isLightbox ? 'text-lg md:text-xl max-w-3xl' : 'text-sm max-w-lg line-clamp-4'} opacity-90 mb-6`}>
            {metadata.description}
          </p>
        )}
        <div className="mb-4">
          <EventDetails metadata={metadata} isLightbox={isLightbox} />
        </div>
        <div className="flex items-center gap-6 mt-auto">
          {metadata?.authorName && (
            <div className={`${isLightbox ? 'text-base md:text-lg' : 'text-xs md:text-sm'}`}>
              <span style={{ color: styles.accentColor }} className="font-semibold">
                {metadata.authorName}
              </span>
            </div>
          )}
          <QRCodeSection publicationLink={metadata?.publicationLink} textColor={styles.textColor} isLightbox={isLightbox} />
          <div className={`${isLightbox ? 'text-sm' : 'text-xs'} opacity-60`}>
            Columbia Business School
          </div>
        </div>
      </div>
    </div>
  )
}

export default NoImageLayout
