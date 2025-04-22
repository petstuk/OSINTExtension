# SOC OSINT Search Extensions

A collection of browser extensions that allow security professionals to quickly search for indicators of compromise (IOCs) across popular OSINT (Open Source Intelligence) tools.

## Repository Structure

This repository contains two browser extensions:

- `/chrome` - Extension for Google Chrome and Chromium-based browsers
- `/firefox` - Extension for Mozilla Firefox
             - You can now find in the Firefox Browser Add-ons Store [here](https://addons.mozilla.org/en-GB/firefox/addon/soc-osint-extension/?utm_source=addons.mozilla.org&utm_medium=referral&utm_content=search)

Each directory contains a standalone version of the extension adapted for that particular browser.

## Features

- Right-click context menu integration for searching selected text
- Configurable search services that can be enabled/disabled via the extension popup
- Support for multiple OSINT services, including:
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

## Installation

### Chrome

See [Chrome Extension README](chrome/README.md) for detailed installation instructions.

### Firefox

See [Firefox Extension README](firefox/README.md) for detailed installation instructions.

## Usage

1. Select any text on a webpage (IP address, domain, hash, etc.)
2. Right-click to open the context menu
3. Navigate to "Search with OSINT tools" and select your preferred OSINT service
4. A new tab will open with the search results for the selected text

## Browser Compatibility

- **Chrome/Chromium**: Version 88 or higher
- **Firefox**: Version 78.0 or higher

## Development Setup

1. Clone this repository:
```
git clone https://github.com/petstuk/osintextension.git
```

2. Make changes to either the Chrome or Firefox versions as needed
3. Follow browser-specific testing instructions in their respective README files

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please ensure that changes work correctly in both Chrome and Firefox versions.

## License

[MIT License](LICENSE)

## Disclaimer

This tool is meant for legitimate security research and incident response. Always ensure you are complying with terms of service for each OSINT platform and applicable laws when using this extension.
