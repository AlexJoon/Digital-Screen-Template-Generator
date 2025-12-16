import { QRCodeSection } from './shared'

/**
 * MediaWideLayout - Horizontal article layout with large image on left
 * Used for: news features, layout_type === 'media_wide'
 */
function MediaWideLayout({ metadata, imageUrl, styles, isLightbox = false, isExport = false, sizes = null }) {
  // Export mode with pixel-based styles
  if (isExport && sizes) {
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', background: styles.background, display: 'flex' }}>
        {/* Left Side - Large Image */}
        <div style={{ width: '40%', position: 'relative' }}>
          {imageUrl ? (
            <img src={imageUrl} alt="Article" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#e5e7eb' }} />
          )}
        </div>

        {/* Right Side - Content */}
        <div style={{ flex: 1, padding: sizes.paddingMedium, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: styles.textColor }}>
          {/* Top */}
          <div>
            {metadata?.caption && (
              <div style={{ fontSize: sizes.bodySM, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', color: styles.accentColor }}>{metadata.caption}</div>
            )}
            {metadata?.headline && (
              <h1 style={{ fontSize: sizes.headlineLG, fontWeight: 'bold', lineHeight: 1.2, marginBottom: '24px' }}>{metadata.headline}</h1>
            )}
            {metadata?.description && (
              <p style={{ fontSize: sizes.bodyMD, opacity: 0.8 }}>{metadata.description}</p>
            )}
          </div>

          {/* Bottom */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              {metadata?.authorName && (
                <div style={{ fontSize: sizes.bodyMD, marginBottom: '8px' }}>
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
      {/* Left Side - Large Image */}
      <div className="w-2/5 relative">
        {imageUrl ? (
          <img src={imageUrl} alt="Article" className="w-full h-full object-cover" />
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
          <QRCodeSection publicationLink={metadata?.publicationLink} textColor={styles.textColor} isLightbox={isLightbox} />
        </div>
      </div>
    </div>
  )
}

export default MediaWideLayout
