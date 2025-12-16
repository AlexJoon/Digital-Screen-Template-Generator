import { QRCodeSection } from './shared'

/**
 * MediaVerticalLayout - Article card with image on top
 * Used for: news articles, blog posts, layout_type === 'media_vertical'
 */
function MediaVerticalLayout({ metadata, imageUrl, styles, isLightbox = false, isExport = false, sizes = null }) {
  // Export mode with pixel-based styles
  if (isExport && sizes) {
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', background: styles.background }}>
        <div style={{ position: 'relative', height: '100%', padding: sizes.paddingMedium, display: 'flex', gap: '48px', color: styles.textColor }}>
          {/* Left Side - Article Card */}
          <div style={{ flex: 1, background: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Top Image */}
            {imageUrl && (
              <div style={{ height: '40%', overflow: 'hidden' }}>
                <img src={imageUrl} alt="Article" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            {/* Article Content */}
            <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', color: '#181a1c' }}>
              {metadata?.caption && (
                <div style={{ fontSize: sizes.small, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>{metadata.caption}</div>
              )}
              {metadata?.headline && (
                <h2 style={{ fontSize: sizes.headlineMD, fontWeight: 'bold', lineHeight: 1.2, marginBottom: '16px' }}>{metadata.headline}</h2>
              )}
              {metadata?.description && (
                <p style={{ fontSize: sizes.bodyMD, opacity: 0.8, flex: 1 }}>{metadata.description}</p>
              )}
            </div>
          </div>

          {/* Right Side - Featured Info */}
          <div style={{ width: '33%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {metadata?.authorName && (
                <div style={{ fontSize: sizes.headlineMD, fontWeight: 600, marginBottom: '16px', color: styles.accentColor }}>
                  Featured: {metadata.authorName}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
              <QRCodeSection publicationLink={metadata?.publicationLink} textColor={styles.textColor} isExport sizes={sizes} />
              <div style={{ fontSize: sizes.bodySM, opacity: 0.6, textAlign: 'center' }}>Columbia Business School</div>
            </div>
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
      <div className={`relative h-full ${isLightbox ? 'p-10 md:p-12' : 'p-5 md:p-6'} flex gap-6`} style={{ color: styles.textColor }}>
        {/* Left Side - Article Card */}
        <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
          {/* Top Image */}
          {imageUrl && (
            <div className="h-2/5 overflow-hidden">
              <img src={imageUrl} alt="Article" className="w-full h-full object-cover" />
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
            <QRCodeSection publicationLink={metadata?.publicationLink} textColor={styles.textColor} isLightbox={isLightbox} />
            <div className={`${isLightbox ? 'text-sm' : 'text-xs'} opacity-60 text-center`}>
              Columbia Business School
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MediaVerticalLayout
