import { QRCodeSection } from './shared'

/**
 * PodcastLayout - Square artwork on left with episode info
 * Used for: podcast episodes, layout_type === 'podcast_standard' or 'podcast_feature'
 */
function PodcastLayout({ metadata, imageUrl, styles, isLightbox = false, isExport = false, sizes = null }) {
  // Export mode with pixel-based styles
  if (isExport && sizes) {
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', background: styles.background, display: 'flex' }}>
        {/* Left Side - Podcast Artwork */}
        <div style={{ width: '40%', padding: sizes.paddingMedium, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {imageUrl ? (
            <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <img src={imageUrl} alt="Podcast Artwork" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '16px', background: 'linear-gradient(135deg, #374151, #111827)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '120px', height: '120px', opacity: 0.5 }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93h2c0 2.76 2.24 5 5 5s5-2.24 5-5h2c0 4.08-3.06 7.44-7 7.93V19h4v2H8v-2h4v-3.07z"/>
              </svg>
            </div>
          )}
        </div>

        {/* Right Side - Episode Info */}
        <div style={{ flex: 1, padding: sizes.paddingMedium, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: styles.textColor }}>
          <div>
            {metadata?.caption && (
              <div style={{ fontSize: sizes.bodySM, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>{metadata.caption || 'Podcast Episode'}</div>
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
                  <span style={{ opacity: 0.6 }}>Host: </span>
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
      {/* Left Side - Podcast Artwork */}
      <div className={`w-2/5 ${isLightbox ? 'p-8' : 'p-4'} flex items-center justify-center`}>
        {imageUrl ? (
          <div className="w-full aspect-square rounded-lg overflow-hidden shadow-2xl">
            <img src={imageUrl} alt="Podcast Artwork" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <svg className={`${isLightbox ? 'w-20 h-20' : 'w-12 h-12'} opacity-50`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93h2c0 2.76 2.24 5 5 5s5-2.24 5-5h2c0 4.08-3.06 7.44-7 7.93V19h4v2H8v-2h4v-3.07z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Right Side - Episode Info */}
      <div className={`flex-1 ${isLightbox ? 'p-8 md:p-10' : 'p-4 md:p-5'} flex flex-col justify-between`} style={{ color: styles.textColor }}>
        <div>
          {metadata?.caption && (
            <div className={`${isLightbox ? 'text-sm' : 'text-xs'} opacity-60 uppercase tracking-wide mb-2`}>
              {metadata.caption || 'Podcast Episode'}
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
                <span className="opacity-60">Host: </span>
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

export default PodcastLayout
