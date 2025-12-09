import { useState } from 'react'
import FormInput from './FormInput'
import FileUploadInput from './FileUploadInput'

function UploadForm({ onSubmit }) {
  // Metadata fields
  const [metadata, setMetadata] = useState({
    headline: '',
    caption: '',
    description: '',
    authorName: '',
    image: null,
    publicationLink: '',
    slideCategory: 'research_spotlight'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ metadata })
  }

  const updateMetadata = (field, value) => {
    setMetadata(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Slide Category Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Slide Category <span className="text-red-500">*</span>
        </label>
        <select
          value={metadata.slideCategory}
          onChange={(e) => updateMetadata('slideCategory', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="research_spotlight">Research Spotlight</option>
          <option value="student_screens">Student Screens</option>
        </select>
        <p className="text-xs text-gray-500">Select the type of digital screen slide</p>
      </div>

      {/* Metadata Fields */}
      <div className="space-y-4 p-4 bg-blue-50">
        <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-blue-300">Slide Information</h3>

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
              rows={3}
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
              helpText="Upload faculty image"
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
              rows={3}
              type="textarea"
              helpText="Description of the content"
            />

            <FileUploadInput
              label="Image"
              value={metadata.image}
              onChange={(value) => updateMetadata('image', value)}
              required={true}
              accept="image/*"
              helpText="Supporting image"
            />
          </>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={!metadata.headline || !metadata.description || !metadata.image}
          className={`py-3 px-6 font-medium transition-all duration-200 flex items-center gap-2 ${
            metadata.headline && metadata.description && metadata.image
              ? 'text-white'
              : 'bg-[#f1f4f7] text-gray-500 cursor-not-allowed'
          }`}
          style={{backgroundColor: (metadata.headline && metadata.description && metadata.image) ? '#181a1c' : '#f1f4f7'}}
        >
          <span>Prep Screen Content</span>
        <svg
          className="w-5 h-5"
          fill="none"
          stroke={(metadata.headline && metadata.description && metadata.image) ? '#009bdb' : '#ccc'}
          viewBox="0 0 24 24"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
      </div>
    </form>
  )
}

export default UploadForm
