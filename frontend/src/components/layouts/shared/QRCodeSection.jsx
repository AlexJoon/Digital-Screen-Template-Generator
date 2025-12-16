import { QRCodeSVG } from 'qrcode.react'

/**
 * QRCodeSection - Shared component for displaying QR code with "Scan for more" label
 * Used across all layout components
 */
function QRCodeSection({ publicationLink, textColor, isLightbox = false, isExport = false, sizes = null }) {
  if (!publicationLink) return null

  // Export mode uses pixel sizes
  if (isExport && sizes) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ backgroundColor: 'white', padding: '8px', borderRadius: '8px' }}>
          <QRCodeSVG
            value={publicationLink}
            size={sizes.qrSize}
            level="L"
          />
        </div>
        <span style={{ fontSize: sizes.small, marginTop: '8px', opacity: 0.7, color: textColor }}>
          Scan for more
        </span>
      </div>
    )
  }

  // Preview mode uses Tailwind classes
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-1 rounded">
        <QRCodeSVG
          value={publicationLink}
          size={isLightbox ? 100 : 60}
          level="L"
        />
      </div>
      <span className={`${isLightbox ? 'text-sm' : 'text-xs'} mt-1 opacity-70`} style={{ color: textColor }}>
        Scan for more
      </span>
    </div>
  )
}

export default QRCodeSection
