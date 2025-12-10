import { useState } from 'react'
import FormInput from './FormInput'
import FileUploadInput from './FileUploadInput'

function UploadForm({ onSubmit, apiBaseUrl = 'http://localhost:8000' }) {
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
      {/* Horizontal Step Timeline - Step 1 Current */}
      <div className="p-4" style={{backgroundColor: '#f1f4f7'}}>
        <div className="flex items-center justify-between">
          {/* Step 1 - Current */}
          <div className="flex flex-col items-center flex-1">
            <div className="w-8 h-8 rounded-full bg-[#181a1c] flex items-center justify-center ring-2 ring-[#009bdb] ring-offset-2">
              <span className="text-white text-sm font-bold">1</span>
            </div>
            <span className="text-xs font-medium text-gray-900 mt-2 text-center">Enter Info</span>
          </div>

          {/* Connector Line */}
          <div className="flex-1 h-0.5 bg-gray-300 -mt-5"></div>

          {/* Step 2 - Pending */}
          <div className="flex flex-col items-center flex-1">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 text-sm font-bold">2</span>
            </div>
            <span className="text-xs font-medium text-gray-500 mt-2 text-center">Select Template</span>
          </div>

          {/* Connector Line */}
          <div className="flex-1 h-0.5 bg-gray-300 -mt-5"></div>

          {/* Step 3 - Pending */}
          <div className="flex flex-col items-center flex-1">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 text-sm font-bold">3</span>
            </div>
            <span className="text-xs font-medium text-gray-500 mt-2 text-center">Export</span>
          </div>
        </div>
      </div>

      {/* Digital Screen Category Selector */}
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
              className="w-full px-0 py-2 pr-8 border-0 border-b-2 border-gray-500 hover:border-[#181a1c] focus:border-[#009bdb] focus:hover:border-[#009bdb] focus:outline-none focus:ring-0 bg-transparent text-gray-900 appearance-none cursor-pointer transition-all duration-300 ease-in-out [&>option]:bg-[#181a1c] [&>option]:text-[#009bdb] [&>option]:py-2"
            >
              <option value="research_spotlight">Research Spotlight</option>
              <option value="student_screens">Student Screens</option>
            </select>
            {/* Plus/Minus icon */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-[#009bdb]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
          <span className="text-xs text-gray-400">* Required</span>
        </div>
      </div>

      {/* Metadata Fields */}
      <div className="space-y-4 p-4 bg-blue-50">
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
