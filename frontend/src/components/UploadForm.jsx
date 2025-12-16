import { useState, useEffect } from 'react'
import FormInput from './FormInput'
import FileUploadInput from './FileUploadInput'
import StepTimeline from './StepTimeline'
import { sectionStyles } from '../styles/constants'

function UploadForm({ onSubmit, apiBaseUrl = 'http://localhost:8000', initialData = null }) {
  // Default metadata state
  const getDefaultMetadata = () => ({
    headline: '',
    caption: '',
    description: '',
    authorName: '',
    image: null,
    publicationLink: '',
    slideCategory: 'research_spotlight',
    eventDate: '',
    eventTime: '',
    eventLocation: ''
  })

  // Initialize metadata from initialData if provided (for going back to edit)
  const [metadata, setMetadata] = useState(() => {
    if (initialData) {
      return {
        headline: initialData.headline || '',
        caption: initialData.caption || '',
        description: initialData.description || '',
        authorName: initialData.authorName || initialData.author_name || '',
        image: initialData.image || null,
        publicationLink: initialData.publicationLink || initialData.publication_link || '',
        slideCategory: initialData.slideCategory || initialData.slide_category || 'research_spotlight',
        eventDate: initialData.eventDate || initialData.event_date || '',
        eventTime: initialData.eventTime || initialData.event_time || '',
        eventLocation: initialData.eventLocation || initialData.event_location || ''
      }
    }
    return getDefaultMetadata()
  })

  // Update metadata when initialData changes (when user navigates back)
  useEffect(() => {
    if (initialData) {
      setMetadata({
        headline: initialData.headline || '',
        caption: initialData.caption || '',
        description: initialData.description || '',
        authorName: initialData.authorName || initialData.author_name || '',
        image: initialData.image || null,
        publicationLink: initialData.publicationLink || initialData.publication_link || '',
        slideCategory: initialData.slideCategory || initialData.slide_category || 'research_spotlight',
        eventDate: initialData.eventDate || initialData.event_date || '',
        eventTime: initialData.eventTime || initialData.event_time || '',
        eventLocation: initialData.eventLocation || initialData.event_location || ''
      })
    }
  }, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ metadata })
  }

  const updateMetadata = (field, value) => {
    setMetadata(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step Timeline - Step 1 Current */}
      <StepTimeline currentStep={1} />

      {/* Digital Screen Category Selector */}
      <div style={sectionStyles}>
        <div className="w-[65%] mx-auto">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Digital Screen Category <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-1">Select the type of digital screen slide</p>
            <div className="relative">
              <select
                value={metadata.slideCategory}
                onChange={(e) => updateMetadata('slideCategory', e.target.value)}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg hover:border-gray-400 focus:border-[#009bdb] focus:outline-none focus:ring-0 bg-white text-gray-900 appearance-none cursor-pointer transition-all duration-300 ease-in-out [&>option]:bg-[#181a1c] [&>option]:text-[#009bdb] [&>option]:py-2"
              >
                <option value="research_spotlight">Research Spotlight</option>
                <option value="student_screens">Student Screens</option>
                <option value="events">Events</option>
                <option value="media_mention">Media Mention</option>
                <option value="congratulations">Congratulations</option>
                <option value="podcast">Podcast</option>
                <option value="announcement">Announcement</option>
              </select>
              {/* Plus icon */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-[#009bdb]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <span className="text-xs text-gray-400">* Required</span>
          </div>
        </div>
      </div>

      {/* Metadata Fields */}
      <div className="space-y-4" style={sectionStyles}>
        <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">Screen Information</h3>

        {metadata.slideCategory === 'research_spotlight' && (
          <>
            {/* Headline and Caption - 50/50 Grid */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Headline"
                value={metadata.headline}
                onChange={(value) => updateMetadata('headline', value)}
                placeholder="How Team Diversity Prevents Collusion in the Workplace"
                required={true}
                maxLength={80}
                helpText="Title summarizing the topic"
              />

              <FormInput
                label="Caption"
                value={metadata.caption}
                onChange={(value) => updateMetadata('caption', value)}
                placeholder="Newly Published"
                maxLength={60}
                helpText="Contextual note (optional)"
              />
            </div>

            {/* Description - Full Width */}
            <FormInput
              label="Description"
              value={metadata.description}
              onChange={(value) => updateMetadata('description', value)}
              placeholder="Research from Columbia Business School reveals how team diversity improves workplace ethics..."
              required={true}
              maxLength={300}
              rows={1}
              type="textarea"
              helpText="Summary or blurb about the content"
            />

            {/* Author Name and Publication Link - 50/50 Grid */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Author Name"
                value={metadata.authorName}
                onChange={(value) => updateMetadata('authorName', value)}
                placeholder="Brett House"
                maxLength={60}
                helpText="Faculty, Researcher, or PhD student (optional)"
              />

              <FormInput
                label="Publication Link"
                value={metadata.publicationLink}
                onChange={(value) => updateMetadata('publicationLink', value)}
                placeholder="https://example.com/article"
                type="url"
                helpText="Link to paper or article (optional)"
              />
            </div>

            {/* Image - Full Width */}
            <FileUploadInput
              label="Image"
              value={metadata.image}
              onChange={(value) => updateMetadata('image', value)}
              required={true}
              accept="image/*"
              helpText="Upload faculty image (AI will auto-center on face with Vision)"
              enableAICrop={true}
              apiBaseUrl={apiBaseUrl}
            />
          </>
        )}

        {metadata.slideCategory === 'student_screens' && (
          <>
            <FormInput
              label="Headline"
              value={metadata.headline}
              onChange={(value) => updateMetadata('headline', value)}
              placeholder="Student Achievement Headline"
              required={true}
              maxLength={80}
              helpText="Title for the student screen"
            />

            <FormInput
              label="Description"
              value={metadata.description}
              onChange={(value) => updateMetadata('description', value)}
              placeholder="Details about the student achievement..."
              required={true}
              maxLength={300}
              rows={1}
              type="textarea"
              helpText="Description of the content"
            />

            <FileUploadInput
              label="Image"
              value={metadata.image}
              onChange={(value) => updateMetadata('image', value)}
              required={true}
              accept="image/*"
              helpText="Supporting image (AI will auto-center on face with Vision)"
              enableAICrop={true}
              apiBaseUrl={apiBaseUrl}
            />
          </>
        )}

        {metadata.slideCategory === 'events' && (
          <>
            {/* Headline - Full Width */}
            <FormInput
              label="Headline"
              value={metadata.headline}
              onChange={(value) => updateMetadata('headline', value)}
              placeholder="AI+ Series: The future of Healthcare"
              required={true}
              maxLength={80}
              helpText="Event title (appears as main header)"
            />

            {/* Description - Full Width */}
            <FormInput
              label="Description"
              value={metadata.description}
              onChange={(value) => updateMetadata('description', value)}
              placeholder="Join us for a discussion on AI and Healthcare where we will..."
              required={true}
              maxLength={300}
              rows={1}
              type="textarea"
              helpText="Brief event details (main body text)"
            />

            {/* Date, Time, Location - 3 Column Grid */}
            <div className="grid grid-cols-3 gap-4">
              <FormInput
                label="Date"
                value={metadata.eventDate}
                onChange={(value) => updateMetadata('eventDate', value)}
                placeholder="February 24, 2025"
                required={true}
                maxLength={40}
                helpText="Event date"
              />

              <FormInput
                label="Time"
                value={metadata.eventTime}
                onChange={(value) => updateMetadata('eventTime', value)}
                placeholder="6:00 PM"
                required={true}
                maxLength={10}
                helpText="Event time"
              />

              <FormInput
                label="Location"
                value={metadata.eventLocation}
                onChange={(value) => updateMetadata('eventLocation', value)}
                placeholder="Cooperman Commons"
                required={true}
                maxLength={40}
                helpText="Event venue"
              />
            </div>

            {/* Image - Full Width */}
            <FileUploadInput
              label="Image"
              value={metadata.image}
              onChange={(value) => updateMetadata('image', value)}
              accept="image/*"
              helpText="Speaker or event visual (optional, AI centers image on slide)"
              enableAICrop={true}
              apiBaseUrl={apiBaseUrl}
            />

            {/* Caption and Publication Link - 50/50 Grid */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Caption"
                value={metadata.caption}
                onChange={(value) => updateMetadata('caption', value)}
                placeholder="Columbia Business School, Manhattanville campus"
                maxLength={80}
                helpText="Image caption or credit (optional)"
              />

              <FormInput
                label="Publication Link"
                value={metadata.publicationLink}
                onChange={(value) => updateMetadata('publicationLink', value)}
                placeholder="https://example.com/event"
                type="url"
                helpText="Link to event page (optional)"
              />
            </div>
          </>
        )}

        {metadata.slideCategory === 'media_mention' && (
          <>
            {/* Headline and Caption - 50/50 Grid */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Headline"
                value={metadata.headline}
                onChange={(value) => updateMetadata('headline', value)}
                placeholder="CBS Faculty Featured in Wall Street Journal"
                required={true}
                maxLength={80}
                helpText="Title highlighting the media coverage"
              />

              <FormInput
                label="Caption"
                value={metadata.caption}
                onChange={(value) => updateMetadata('caption', value)}
                placeholder="As Seen In"
                maxLength={60}
                helpText="Media outlet or contextual note (optional)"
              />
            </div>

            {/* Description - Full Width */}
            <FormInput
              label="Description"
              value={metadata.description}
              onChange={(value) => updateMetadata('description', value)}
              placeholder="Professor John Smith discusses market trends and economic forecasts in this exclusive interview..."
              required={true}
              maxLength={300}
              rows={1}
              type="textarea"
              helpText="Summary of the media coverage"
            />

            {/* Author Name and Publication Link - 50/50 Grid */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Faculty Name"
                value={metadata.authorName}
                onChange={(value) => updateMetadata('authorName', value)}
                placeholder="Professor Jane Doe"
                maxLength={60}
                helpText="Featured faculty member (optional)"
              />

              <FormInput
                label="Article Link"
                value={metadata.publicationLink}
                onChange={(value) => updateMetadata('publicationLink', value)}
                placeholder="https://wsj.com/article"
                type="url"
                helpText="Link to the full article (for QR code)"
              />
            </div>

            {/* Image - Full Width */}
            <FileUploadInput
              label="Image"
              value={metadata.image}
              onChange={(value) => updateMetadata('image', value)}
              required={true}
              accept="image/*"
              helpText="Faculty photo or article preview image (AI will auto-center)"
              enableAICrop={true}
              apiBaseUrl={apiBaseUrl}
            />
          </>
        )}

        {metadata.slideCategory === 'congratulations' && (
          <>
            {/* Headline and Caption - 50/50 Grid */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Headline"
                value={metadata.headline}
                onChange={(value) => updateMetadata('headline', value)}
                placeholder="Congratulations Dr. Smith on Receiving the Nobel Prize"
                required={true}
                maxLength={80}
                helpText="Recognition headline"
              />

              <FormInput
                label="Caption"
                value={metadata.caption}
                onChange={(value) => updateMetadata('caption', value)}
                placeholder="Faculty Achievement"
                maxLength={60}
                helpText="Category or type of recognition (optional)"
              />
            </div>

            {/* Description - Full Width */}
            <FormInput
              label="Description"
              value={metadata.description}
              onChange={(value) => updateMetadata('description', value)}
              placeholder="We celebrate Professor Smith's groundbreaking contributions to the field of economics..."
              required={true}
              maxLength={300}
              rows={1}
              type="textarea"
              helpText="Details about the accomplishment or honor"
            />

            {/* Honoree Name - Full Width */}
            <FormInput
              label="Honoree Name"
              value={metadata.authorName}
              onChange={(value) => updateMetadata('authorName', value)}
              placeholder="Dr. Jane Smith"
              maxLength={60}
              helpText="Faculty or PhD student being recognized (optional)"
            />

            {/* Image - Full Width */}
            <FileUploadInput
              label="Image"
              value={metadata.image}
              onChange={(value) => updateMetadata('image', value)}
              required={true}
              accept="image/*"
              helpText="Photo of the honoree (AI will auto-center on face)"
              enableAICrop={true}
              apiBaseUrl={apiBaseUrl}
            />
          </>
        )}

        {metadata.slideCategory === 'podcast' && (
          <>
            {/* Headline and Caption - 50/50 Grid */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Headline"
                value={metadata.headline}
                onChange={(value) => updateMetadata('headline', value)}
                placeholder="New Episode: The Future of Business Education"
                required={true}
                maxLength={80}
                helpText="Podcast episode or series title"
              />

              <FormInput
                label="Caption"
                value={metadata.caption}
                onChange={(value) => updateMetadata('caption', value)}
                placeholder="CBS Podcast Series"
                maxLength={60}
                helpText="Podcast name or series (optional)"
              />
            </div>

            {/* Description - Full Width */}
            <FormInput
              label="Description"
              value={metadata.description}
              onChange={(value) => updateMetadata('description', value)}
              placeholder="In this episode, we explore the evolving landscape of business education with leading experts..."
              required={true}
              maxLength={300}
              rows={1}
              type="textarea"
              helpText="Episode summary or teaser"
            />

            {/* Host Name and Podcast Link - 50/50 Grid */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Host / Guest Name"
                value={metadata.authorName}
                onChange={(value) => updateMetadata('authorName', value)}
                placeholder="Hosted by Professor John Doe"
                maxLength={60}
                helpText="Podcast host or featured guest (optional)"
              />

              <FormInput
                label="Podcast Link"
                value={metadata.publicationLink}
                onChange={(value) => updateMetadata('publicationLink', value)}
                placeholder="https://podcasts.apple.com/..."
                type="url"
                helpText="Link to episode or platform (for QR code)"
              />
            </div>

            {/* Image - Full Width */}
            <FileUploadInput
              label="Image"
              value={metadata.image}
              onChange={(value) => updateMetadata('image', value)}
              required={true}
              accept="image/*"
              helpText="Podcast cover art or host photo (AI will auto-center)"
              enableAICrop={true}
              apiBaseUrl={apiBaseUrl}
            />
          </>
        )}

        {metadata.slideCategory === 'announcement' && (
          <>
            {/* Headline and Caption - 50/50 Grid */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Headline"
                value={metadata.headline}
                onChange={(value) => updateMetadata('headline', value)}
                placeholder="New MBA Program Launch for Fall 2025"
                required={true}
                maxLength={80}
                helpText="Announcement headline"
              />

              <FormInput
                label="Caption"
                value={metadata.caption}
                onChange={(value) => updateMetadata('caption', value)}
                placeholder="School-Wide Announcement"
                maxLength={60}
                helpText="Announcement type or category (optional)"
              />
            </div>

            {/* Description - Full Width */}
            <FormInput
              label="Description"
              value={metadata.description}
              onChange={(value) => updateMetadata('description', value)}
              placeholder="Columbia Business School is proud to announce a new innovative program designed to..."
              required={true}
              maxLength={300}
              rows={1}
              type="textarea"
              helpText="Details about the announcement"
            />

            {/* Publication Link - Full Width */}
            <FormInput
              label="More Info Link"
              value={metadata.publicationLink}
              onChange={(value) => updateMetadata('publicationLink', value)}
              placeholder="https://gsb.columbia.edu/announcement"
              type="url"
              helpText="Link for more information (optional, for QR code)"
            />

            {/* Image - Full Width */}
            <FileUploadInput
              label="Image"
              value={metadata.image}
              onChange={(value) => updateMetadata('image', value)}
              accept="image/*"
              helpText="Supporting visual (optional, AI will auto-center)"
              enableAICrop={true}
              apiBaseUrl={apiBaseUrl}
            />
          </>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        {(() => {
          // Events require date, time, location but image is optional
          const isEventsValid = metadata.slideCategory === 'events' &&
            metadata.headline && metadata.description &&
            metadata.eventDate && metadata.eventTime && metadata.eventLocation;

          // Announcement - image is optional
          const isAnnouncementValid = metadata.slideCategory === 'announcement' &&
            metadata.headline && metadata.description;

          // All other categories require headline, description, and image
          const isStandardValid = !['events', 'announcement'].includes(metadata.slideCategory) &&
            metadata.headline && metadata.description && metadata.image;

          const isFormValid = isEventsValid || isAnnouncementValid || isStandardValid;

          return (
            <button
              type="submit"
              disabled={!isFormValid}
              className={`py-3 px-6 font-medium transition-all duration-200 flex items-center gap-2 ${
                isFormValid
                  ? 'text-white'
                  : 'bg-[#f1f4f7] text-gray-500 cursor-not-allowed'
              }`}
              style={{backgroundColor: isFormValid ? '#181a1c' : '#f1f4f7'}}
            >
              <span>Prep Screen Content</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke={isFormValid ? '#009bdb' : '#ccc'}
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          );
        })()}
      </div>
    </form>
  )
}

export default UploadForm
