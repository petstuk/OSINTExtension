# SOC OSINT Search Firefox Extension

A Firefox extension that allows security professionals to quickly search for indicators of compromise (IOCs) such as IP addresses, domains, file hashes, and other security indicators across popular OSINT (Open Source Intelligence) tools.

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

1. Clone this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..." and select the `manifest.json` file from the firefox directory
4. The extension should now be installed and visible in your Firefox toolbar

For permanent installation:
1. Package the extension as a .xpi file
2. Submit to Firefox Add-ons for review or install locally by navigating to `about:addons`
3. Click the gear icon and select "Install Add-on From File..." then select your .xpi file

## Usage

1. Select any text on a webpage (IP address, domain, hash, etc.)
2. Right-click to open the context menu
3. Navigate to "Search with OSINT tools" and select your preferred OSINT service
4. A new tab will open with the search results for the selected text

## Configuration

1. Click on the extension icon in the Firefox toolbar to open the configuration popup
2. Toggle the switches to enable or disable specific OSINT services
3. Click "Reset to Defaults" to restore the default configuration if needed

## File Structure

- `manifest.json` - Extension manifest file with configuration and permissions
- `background.js` - Background script that handles context menu creation and search functionality
- `popup.html` - HTML for the configuration popup
- `popup.js` - JavaScript for the configuration popup
- `icon512.png` - Extension icon

## Permissions

This extension requires the following permissions:
- `contextMenus` - To create and manage the right-click context menu
- `storage` - To save your configuration preferences

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](../LICENSE)

## Disclaimer

This tool is meant for legitimate security research and incident response. Always ensure you are complying with terms of service for each OSINT platform and applicable laws when using this extension.