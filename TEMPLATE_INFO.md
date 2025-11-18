# Custom Branded Template Configuration

## Overview

The Campus Event Slide Generator uses your custom branded template from SlideSpeak to ensure every generated presentation matches your campus brand identity.

## Template Details

**Template ID**: `cm6iali9y000njl03qw4hvuk3`

This template is automatically applied to all generated presentations, ensuring:
- Consistent campus branding
- Professional appearance
- Digital screen optimization
- Standardized layout across all events

---

## How It Works

### Automatic Application

Every time a staff member generates event slides, the system:

1. **Uploads** the event content to SlideSpeak
2. **Processes** the content with OpenAI for digital screen optimization
3. **Generates** slides using your branded template (`cm6iali9y000njl03qw4hvuk3`)
4. **Returns** a fully branded PowerPoint presentation

**No manual template selection needed** - it's all automatic!

---

## Configuration

### Location

The template ID is configured in multiple places for flexibility:

#### 1. Environment Variable (Primary)
**File**: `backend/.env`
```bash
SLIDESPEAK_TEMPLATE_ID=cm6iali9y000njl03qw4hvuk3
```

#### 2. Settings Configuration
**File**: `backend/config.py`
```python
slidespeak_template_id: str = "cm6iali9y000njl03qw4hvuk3"
```

#### 3. Service Integration
**File**: `backend/services/slidespeak_service.py`
```python
"theme": settings.slidespeak_template_id
```

---

## Changing the Template

If you need to use a different template in the future:

### Option 1: Update Environment Variable (Recommended)

Edit `backend/.env`:
```bash
SLIDESPEAK_TEMPLATE_ID=your_new_template_id_here
```

Then restart the backend server.

### Option 2: Update Config Default

Edit `backend/config.py`:
```python
slidespeak_template_id: str = "your_new_template_id_here"
```

---

## Template Features

Your branded template should include:

### Required Elements

- **Campus Logo**: Positioned consistently across slides
- **Brand Colors**: Campus color palette applied
- **Brand Fonts**: Official campus typography
- **16:9 Aspect Ratio**: Optimized for digital screens

### Slide Layouts

The template should support these slide types for optimal results:

1. **Title Slide** (Slide 1)
   - Large event title
   - Attention-grabbing hook or tagline
   - Campus branding elements

2. **Content Slide** (Slide 2)
   - Date, time, location
   - Key details in large, readable text
   - High contrast for visibility

3. **Highlights Slide** (Slide 3)
   - Bullet points or features
   - Call-to-action
   - Registration/contact information

---

## Template Management in SlideSpeak

### Accessing Your Template

1. Log in to [SlideSpeak](https://slidespeak.co)
2. Navigate to **Templates** or **Brand Settings**
3. Find template ID: `cm6iali9y000njl03qw4hvuk3`

### Editing the Template

To modify your template design:

1. Update the template in SlideSpeak dashboard
2. Changes automatically apply to all future generations
3. No code changes needed in this application
4. Template ID remains the same

### Creating a New Template

If you want to create a new template:

1. Design template in SlideSpeak
2. Note the new template ID
3. Update `SLIDESPEAK_TEMPLATE_ID` in `backend/.env`
4. Restart backend server

---

## Verification

### Check Template is Applied

After generating slides, verify branding:

✅ **Campus logo** appears on slides
✅ **Brand colors** are used
✅ **Brand fonts** are applied
✅ **Consistent layout** across all slides

### Troubleshooting

**Problem**: Slides don't show branded template

**Solutions**:

1. **Verify Template ID**
   ```bash
   # Check .env file
   cat backend/.env | grep SLIDESPEAK_TEMPLATE_ID
   ```

2. **Check Template Status in SlideSpeak**
   - Log in to SlideSpeak
   - Confirm template is active
   - Verify template ID matches

3. **Restart Backend**
   ```bash
   # Changes to .env require restart
   cd backend
   python main.py
   ```

4. **Check API Response**
   - Look at backend logs
   - Verify `theme` parameter is sent to API
   - Check for any API errors

---

## API Integration Details

### Request Payload

When generating presentations, the system sends:

```json
{
  "plain_text": "Event content...",
  "length": 3,
  "tone": "professional",
  "theme": "cm6iali9y000njl03qw4hvuk3",  // Your template ID
  "use_branding_logo": true,
  "use_branding_fonts": true,
  ...
}
```

### SlideSpeak Processing

SlideSpeak then:
1. Loads your template (`cm6iali9y000njl03qw4hvuk3`)
2. Populates slides with event content
3. Applies branding elements
4. Generates PowerPoint file
5. Returns download URL

---

## Best Practices

### Template Design

**Do:**
- Use large, readable fonts (min 24pt for body text)
- High contrast text/background colors
- Simple, clean layouts
- Consistent positioning of logo
- 16:9 widescreen format

**Don't:**
- Use small fonts (< 20pt)
- Overcrowd slides with design elements
- Use low-contrast color combinations
- Include unnecessary graphics
- Use outdated aspect ratios (4:3)

### Template Updates

**When to update template:**
- Campus rebrand or logo change
- Updated brand guidelines
- Improved digital screen layouts
- User feedback on readability

**How to update:**
1. Edit in SlideSpeak (template ID stays same)
2. Or create new template and update config
3. Test with sample event before full rollout

---

## Multi-Template Support (Future Enhancement)

While currently configured for one template, the system can support multiple templates:

### Potential Use Cases

- **Different event types**: Academic, social, athletics
- **Different departments**: Each with their own sub-brand
- **Different screen types**: Vertical vs. horizontal displays

### Implementation

Would require:
1. Template selection in frontend UI
2. Pass template ID as parameter
3. Update backend to accept dynamic template ID

---

## Support

### Template Questions

**For template design/branding:**
- Contact: Campus Communications Office
- SlideSpeak: support@slidespeak.co

**For technical issues:**
- Check backend logs
- Verify template ID in configuration
- Test with SlideSpeak API directly

### Resources

- [SlideSpeak Template Documentation](https://docs.slidespeak.co/basics/custom-templates)
- [SlideSpeak API Reference](https://docs.slidespeak.co/basics/api-references)
- Your SlideSpeak Dashboard: https://slidespeak.co

---

## Summary

✅ **Template ID**: `cm6iali9y000njl03qw4hvuk3`
✅ **Automatically applied** to all presentations
✅ **Configured in**: `backend/.env`
✅ **Easy to update** via environment variable
✅ **Ensures consistent** campus branding

Your branded template is the foundation of professional, on-brand event slides for your campus!
