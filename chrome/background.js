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

// Microsoft Apps URL
const MICROSOFT_APPS_URL = "https://raw.githubusercontent.com/merill/microsoft-info/main/_info/MicrosoftApps.json";

// Initialize the extension
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed or updated");
  
  // Set default enabled services
  chrome.storage.sync.get('enabledServices', (data) => {
    if (!data.enabledServices) {
      console.log("Setting default enabled services");
      chrome.storage.sync.set({ 'enabledServices': defaultServices });
      enabledServices = defaultServices;
    } else {
      console.log("Using existing enabled services");
      enabledServices = data.enabledServices;
    }
    
    // Create context menus after data is loaded
    console.log("Creating context menus");
    chrome.contextMenus.removeAll(() => {
      createContextMenus();
    });
  });
});

// Listen for changes to enabled services
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.enabledServices) {
    console.log("Enabled services changed, updating context menus");
    enabledServices = changes.enabledServices.newValue;
    
    // Recreate context menus when settings change
    chrome.contextMenus.removeAll(() => {
      createContextMenus();
    });
  }
});

// Create context menu items
function createContextMenus() {
  try {
    // Create Microsoft Apps search menu item
    chrome.contextMenus.create({
      id: "microsoft-apps-search",
      title: "Microsoft Apps",
      contexts: ["selection"]
    }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error creating Microsoft Apps context menu:", chrome.runtime.lastError);
      } else {
        console.log("Microsoft Apps context menu created successfully");
      }
    });
    
    // Create individual menu items for each enabled OSINT service
    for (const [service, enabled] of Object.entries(enabledServices)) {
      if (enabled) {
        chrome.contextMenus.create({
          id: `search-${service}`,
          title: service,
          contexts: ["selection"]
        }, () => {
          if (chrome.runtime.lastError) {
            console.error(`Error creating context menu for ${service}:`, chrome.runtime.lastError);
          }
        });
      }
    }
  } catch (error) {
    console.error("Error in createContextMenus:", error);
  }
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log("Context menu clicked:", info.menuItemId);
  const selectedText = info.selectionText.trim();
  
  if (info.menuItemId === "microsoft-apps-search") {
    console.log("Microsoft Apps search clicked, text:", selectedText);
    
    // Open Microsoft Apps page
    chrome.tabs.create({ url: MICROSOFT_APPS_URL }, (newTab) => {
      console.log("Microsoft Apps page opened, tab ID:", newTab.id);
      
      // Wait for the page to load before attempting to search
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tab) {
        if (tabId === newTab.id && changeInfo.status === 'complete') {
          console.log("Microsoft Apps page loaded, executing search");
          chrome.tabs.onUpdated.removeListener(listener);
          
          // Execute search
          chrome.scripting.executeScript({
            target: { tabId: newTab.id },
            function: performSearch,
            args: [selectedText]
          }).then(() => {
            console.log("Search executed successfully");
          }).catch((error) => {
            console.error("Error executing search:", error);
          });
        }
      });
    });
  } 
  else if (info.menuItemId.startsWith("search-")) {
    // Handle OSINT search
    const serviceName = info.menuItemId.replace("search-", "");
    
    if (serviceUrls[serviceName]) {
      const url = serviceUrls[serviceName].replace("[QUERY]", encodeURIComponent(selectedText));
      chrome.tabs.create({ url: url });
    }
  }
});

// Function to execute in the context of the page to trigger the search
function performSearch(searchText) {
  console.log("Performing search for:", searchText);
  
  // Wait a short moment to ensure the page is ready
  setTimeout(() => {
    // Programmatically trigger Ctrl+F
    window.find(searchText);
  }, 1000); // Increased delay for better reliability
}