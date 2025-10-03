# SOC OSINT Search Extension

A modern, unified browser extension that allows security professionals to quickly search for indicators of compromise (IoCs) across popular OSINT (Open Source Intelligence) tools with a sleek cyber aesthetic.

## 🚀 Features

### **Core Functionality**
- **Right-click Context Menu Integration** - Select any IoC and search across multiple OSINT tools
- **Unified Extension** - Single codebase that works on both Chrome and Firefox
- **Modern Cyber UI** - Dark-themed interface with gradient accents and smooth animations
- **Cross-Browser Compatible** - Works seamlessly on both Chrome/Chromium and Firefox

### **🎯 Custom Combinations**
Create your own multi-tool searches for one-click analysis:
- Combine 2+ tools into custom shortcuts (e.g., "IP Investigator")
- Appears at the top of context menu with ⚡ icon
- Opens all selected tools simultaneously
- Perfect for SOC analysts with favorite tool combinations

### **📊 Analysis History**
- **Recent Analysis** - Last 5 IoCs displayed in popup for quick access
- **Full Archive** - Beautiful archive page with all historical searches
- **Smart Filtering** - Filter by IoC type (IP, Domain, Hash, URL)
- **Re-analyze Button** - Quickly re-run any previous search
- **Statistics Dashboard** - Track total analyses, most used tools, and common IoC types

### **🛠️ Supported OSINT Services**
- VirusTotal
- AbuseIPDB
- URLScan
- Shodan
- Censys
- AlienVault OTX
- ThreatCrowd
- IBM X-Force Exchange
- MalwareBazaar
- GreyNoise

### **🔍 Intelligent IoC Detection**
Automatically detects and analyzes:
- IPv4 and IPv6 addresses
- Domain names
- MD5, SHA1, SHA256 hashes
- URLs

## 📦 Installation

### Firefox

#### Method 1: Temporary Installation (Development/Testing)
1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the sidebar
3. Click "Load Temporary Add-on"
4. Navigate to the extension directory and select `manifest.json`

#### Method 2: Official Add-on Store (Coming Soon)
Will be available on the Firefox Browser Add-ons Store

### Chrome

#### Temporary Installation (Development/Testing)
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the extension directory

## 🎨 User Interface

### **Popup**
- **Dark cyber-themed** interface with gradient accents
- **Recent Analysis** section showing last 5 searches
- **Service Toggles** - Enable/disable individual OSINT tools
- **Custom Combinations** - Create and manage multi-tool shortcuts
- **Smooth scrolling** with custom styled scrollbar

### **Archive Page**
- **Animated grid background** for cyber aesthetic
- **Statistics cards** showing analysis metrics
- **Filter buttons** for IoC types
- **Professional table** with hover effects
- **Glassmorphism design** with backdrop blur

## 💡 Usage

### Basic Search
1. **Select text** on any webpage (IP address, domain, hash, URL)
2. **Right-click** to open the context menu
3. **Navigate to "SOC OSINT Search"**
4. **Select your preferred OSINT service**
5. A new tab will open with the search results

### Custom Combinations
1. **Open the extension popup**
2. **Scroll to "Custom Combinations"**
3. **Click "+ New Combination"**
4. **Enter a name** (e.g., "IP Investigator")
5. **Select 2 or more tools** (e.g., AbuseIPDB + VirusTotal)
6. **Click "Save"**
7. Your custom combination now appears in the context menu with a ⚡ icon

### View History
1. **Open the extension popup**
2. **View recent analyses** in the "Recent Analysis" section
3. **Click "View Full Archive"** to see all historical searches
4. **Filter by IoC type** using the buttons at the top
5. **Click "Re-analyze"** to quickly re-run any search

## 🏗️ Technical Details

### Architecture
- **Manifest v2** for cross-browser compatibility
- **Background Script** - Handles context menus and storage
- **Popup Script** - Manages UI and user interactions
- **Archive Script** - Handles history display and filtering
- **External Scripts** - All JavaScript is in separate files (CSP compliant)

### Storage
- **browser.storage.sync** for cross-device synchronization
- Stores:
  - Enabled services configuration
  - Custom combinations
  - Analysis history (up to 100 entries)

### Browser API Compatibility
- **Polyfill layer** handles Chrome/Firefox API differences
- Automatic detection of callback vs promise-based APIs
- Graceful fallbacks for unsupported features

## 🎯 Browser Compatibility

- **Chrome/Chromium**: Version 88 or higher
- **Firefox**: Version 78.0 or higher
- **Edge**: Chromium-based versions

## 🛠️ Development

### Setup
```bash
git clone https://github.com/petstuk/OSINTExtension.git
cd OSINTExtension
```

### File Structure
```
├── manifest.json          # Extension manifest (Manifest v2)
├── background.js          # Background script
├── popup.html             # Extension popup UI
├── popup.js               # Popup logic
├── archive.html           # History archive page
├── archive.js             # Archive page logic
├── icon512.png            # Extension icon
└── README.md              # This file
```

### Testing
1. Load the extension in Firefox using `about:debugging`
2. Open `test-history.html` in a browser tab
3. Right-click on various IoCs to test functionality
4. Check browser console for debug logs

### Debug Tools
- **debug-storage.html** - Tool for inspecting extension storage
- Console logging throughout for troubleshooting
- All API calls include error handling and logging

## 🎨 Design Philosophy

- **Cyber Aesthetic** - Dark themes, gradient accents, smooth animations
- **Professional** - Clean, modern interface suitable for SOC environments
- **Efficient** - Minimal clicks to perform common tasks
- **Customizable** - Users can create their own workflows
- **Responsive** - Works well at different screen sizes

## 📝 Changelog

### Latest Version
- ✅ Unified Chrome/Firefox extension
- ✅ Modern cyber-themed UI
- ✅ Custom combinations feature
- ✅ Full history tracking with archive
- ✅ IoC type detection (IPv4, IPv6, hashes, domains, URLs)
- ✅ Statistics dashboard
- ✅ Custom styled confirmation modals
- ✅ Smooth animations and transitions

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test in both Chrome and Firefox
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature-name`
7. Open a Pull Request

## 📄 License

[MIT License](LICENSE)

## ⚠️ Disclaimer

This tool is meant for legitimate security research and incident response. Always ensure you are complying with:
- Terms of service for each OSINT platform
- Your organization's security policies
- Applicable laws and regulations

## 🙏 Acknowledgments

- Inspired by the needs of SOC analysts and security researchers
- UI design influenced by modern cyber security platforms
- Built with security professionals in mind

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Include browser version and console logs when reporting bugs

---

**Made with ❤️ for the security community**
