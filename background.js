// Use Chrome API directly for Chrome extension
let enabledServices = {};

// Default services that will be enabled on first install
const defaultServices = {
  "VirusTotal": true,
  "AbuseIPDB": true,
  "URLScan": true,
  "Shodan": true,
  "Censys": true,
  "AlienVault OTX": true,
  "ThreatCrowd": true,
  "IBM X-Force Exchange": true,
  "MalwareBazaar": true,
  "GreyNoise": true
};

// Service URLs for searching
const serviceUrls = {
  "VirusTotal": "https://www.virustotal.com/gui/search/[QUERY]",
  "AbuseIPDB": "https://www.abuseipdb.com/check/[QUERY]",
  "URLScan": "https://urlscan.io/search/#[QUERY]",
  "Shodan": "https://www.shodan.io/search?query=[QUERY]",
  "Censys": "https://search.censys.io/search?q=[QUERY]",
  "AlienVault OTX": "https://otx.alienvault.com/browse/pulses?q=[QUERY]",
  "ThreatCrowd": "https://threatcrowd.org/ip.php?ip=[QUERY]",
  "IBM X-Force Exchange": "https://exchange.xforce.ibmcloud.com/search/[QUERY]",
  "MalwareBazaar": "https://bazaar.abuse.ch/browse.php?search=[QUERY]",
  "GreyNoise": "https://viz.greynoise.io/query/?gnql=[QUERY]"
};

// Initialize the extension
chrome.runtime.onInstalled.addListener(() => {
  // Set default enabled services
  chrome.storage.sync.get('enabledServices', (data) => {
    if (!data.enabledServices) {
      chrome.storage.sync.set({ 'enabledServices': defaultServices });
      enabledServices = defaultServices;
    } else {
      enabledServices = data.enabledServices;
    }
    createContextMenus();
  });
});

// Listen for changes to enabled services
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.enabledServices) {
    enabledServices = changes.enabledServices.newValue;
    // Recreate context menus when settings change
    chrome.contextMenus.removeAll(createContextMenus);
  }
});

// Create context menu items based on enabled services
function createContextMenus() {
  // Create parent menu item
  chrome.contextMenus.create({
    id: "osintSearchParent",
    title: "Search with OSINT tools",
    contexts: ["selection"]
  });

  // Create child menu items for each enabled service
  for (const [service, enabled] of Object.entries(enabledServices)) {
    if (enabled) {
      chrome.contextMenus.create({
        id: `search-${service}`,
        parentId: "osintSearchParent",
        title: `Search ${service}`,
        contexts: ["selection"]
      });
    }
  }
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const serviceName = info.menuItemId.replace("search-", "");
  const selectedText = info.selectionText.trim();
  
  if (serviceUrls[serviceName]) {
    const url = serviceUrls[serviceName].replace("[QUERY]", encodeURIComponent(selectedText));
    chrome.tabs.create({ url: url });
  }
});