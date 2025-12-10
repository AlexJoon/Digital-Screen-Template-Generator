# Neue Haas Grotesk Display Pro Font Files

This directory should contain the Neue Haas Grotesk Display Pro font files.

## Required Files

Place the following font files in this directory:

### Regular (400 weight)
- `NeueHaasDisplayRoman.woff2`
- `NeueHaasDisplayRoman.woff`
- `NeueHaasDisplayRoman.ttf`

### Medium (500 weight)
- `NeueHaasDisplayMedium.woff2`
- `NeueHaasDisplayMedium.woff`
- `NeueHaasDisplayMedium.ttf`

### Bold (700 weight)
- `NeueHaasDisplayBold.woff2`
- `NeueHaasDisplayBold.woff`
- `NeueHaasDisplayBold.ttf`

## Where to Get the Fonts

Neue Haas Grotesk Display Pro is a commercial font. You can obtain it from:

1. **Your organization's brand assets** - Check with your marketing/brand team
2. **Adobe Fonts** - If you have an Adobe Creative Cloud subscription
3. **Monotype** - Purchase directly from the foundry
4. **MyFonts** - Licensed font marketplace

## File Formats

- `.woff2` - Modern browsers (recommended, smallest file size)
- `.woff` - Fallback for older browsers
- `.ttf` - Broader compatibility

## Once You Have the Files

1. Place the font files in this directory (`frontend/public/fonts/`)
2. Ensure the file names match exactly as listed above
3. The fonts will automatically load when you run the application
4. Clear your browser cache to see the changes

## Testing

To verify the fonts are loading correctly:

1. Open the application in your browser
2. Open Developer Tools (F12)
3. Go to the Network tab
4. Filter by "Font"
5. You should see the font files loading successfully

Alternatively, inspect any text element and check the computed font-family in the Styles panel.
