# 📞 Customer Service Scripts Manager

A professional, easy-to-use web application for managing and accessing customer service scripts. Click any script card to copy its content to your clipboard!

## Features

✨ **Key Features:**
- 📋 **Click-to-Copy**: Instantly copy any script to your clipboard
- 🎨 **Professional UI**: Modern dark theme with smooth animations
- 🔍 **Search & Filter**: Find scripts by title, content, or category
- ✏️ **Easy Editing**: Edit all scripts in JSON format with real-time validation
- 💾 **Local Storage**: Scripts are saved locally in your browser
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- 🚀 **No Installation**: Just open in a browser and start using

## Getting Started

### Quick Start
1. Open `index.html` in your web browser
2. Click on any script card to copy it to your clipboard
3. Use the search box to find specific scripts
4. Filter by category using the dropdown menu

### Editing Scripts

1. Click the **✏️ Edit Scripts** button at the bottom
2. Edit the JSON data in the modal
3. Click **Save Changes** to update
4. Your changes are automatically saved to your browser

### Script JSON Format

Each script should follow this structure:

```json
{
  "id": 1,
  "category": "Greeting",
  "title": "Script Title",
  "content": "Your script content here..."
}
```

**Required fields:**
- `id`: Unique number for each script
- `category`: Category name (e.g., "Greeting", "Billing", "Issue Resolution")
- `title`: Short title for the script
- `content`: Full script text (supports multi-line text)

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

## Storage

- Scripts are stored in your browser's **Local Storage**
- Data persists between browser sessions
- Clear browser cache/cookies will reset scripts to defaults

## Tips & Tricks

💡 **Search Tips:**
- Search by title: Type the script name
- Search by content: Find scripts containing specific keywords
- Use category filter for quick navigation

📝 **Editing Tips:**
- Validate JSON before saving (proper brackets and quotes)
- Use `\n` for line breaks in the JSON editor
- Add `id` field automatically assigned if missing
- Categories are auto-populated from your scripts

## Version

**Version:** 1.0  
**Last Updated:** 2026
