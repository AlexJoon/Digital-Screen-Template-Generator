/**
 * EventDetails - Shared component for displaying event date, time, and location
 * Used across all layout components
 */
function EventDetails({ metadata, isLightbox = false, isExport = false, sizes = null }) {
  // Check if there are any event details to display
  const eventDate = metadata?.eventDate || metadata?.event_date
  const eventTime = metadata?.eventTime || metadata?.event_time
  const eventLocation = metadata?.eventLocation || metadata?.event_location

  if (!(eventDate || eventTime || eventLocation)) {
    return null
  }

  // Export mode uses pixel sizes
  if (isExport && sizes) {
    return (
      <div style={{ fontSize: sizes.bodySM, opacity: 0.9, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {eventDate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>{eventDate}</span>
          </div>
        )}
        {eventTime && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>{eventTime}</span>
          </div>
        )}
        {eventLocation && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>{eventLocation}</span>
          </div>
        )}
      </div>
    )
  }

  // Preview mode uses Tailwind classes
  return (
    <div className={`${isLightbox ? 'text-sm md:text-base' : 'text-xs'} opacity-90 space-y-1`}>
      {eventDate && (
        <div className="flex items-center gap-2">
          <svg className={`${isLightbox ? 'w-4 h-4' : 'w-3 h-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>{eventDate}</span>
        </div>
      )}
      {eventTime && (
        <div className="flex items-center gap-2">
          <svg className={`${isLightbox ? 'w-4 h-4' : 'w-3 h-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>{eventTime}</span>
        </div>
      )}
      {eventLocation && (
        <div className="flex items-center gap-2">
          <svg className={`${isLightbox ? 'w-4 h-4' : 'w-3 h-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>{eventLocation}</span>
        </div>
      )}
    </div>
  )
}

export default EventDetails
