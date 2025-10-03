// Universal browser API compatibility
// Works for both Chrome and Firefox
const browserAPI = (() => {
  if (typeof browser !== 'undefined') {
    return browser; // Firefox
  } else if (typeof chrome !== 'undefined') {
    return chrome;  // Chrome
  } else {
    throw new Error('No browser API available');
  }
})();

// Use universal API for all operations
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
function initializeExtension() {
  console.log("Initializing unified OSINT extension");
  
  // Use promise-based API for Firefox, callback for Chrome
  if (browserAPI.storage.sync.get.length > 1) {
    // Chrome-style callback API
    browserAPI.storage.sync.get('enabledServices', (data) => {
      if (!data.enabledServices) {
        console.log("Setting default enabled services");
        browserAPI.storage.sync.set({ 'enabledServices': defaultServices }, () => {
          enabledServices = defaultServices;
          createContextMenus();
        });
      } else {
        console.log("Using existing enabled services");
        enabledServices = data.enabledServices;
        createContextMenus();
      }
    });
  } else {
    // Firefox-style promise API
    browserAPI.storage.sync.get('enabledServices').then((data) => {
      if (!data.enabledServices) {
        console.log("Setting default enabled services");
        browserAPI.storage.sync.set({ 'enabledServices': defaultServices }).then(() => {
          enabledServices = defaultServices;
          createContextMenus();
        });
      } else {
        console.log("Using existing enabled services");
        enabledServices = data.enabledServices;
        createContextMenus();
      }
    }).catch(error => {
      console.error("Error loading enabled services:", error);
      enabledServices = defaultServices;
      createContextMenus();
    });
  }
}

// Run on startup
initializeExtension();

// Also run on installed
browserAPI.runtime.onInstalled.addListener(() => {
  console.log("Extension installed or updated");
  initializeExtension();
});

// Listen for changes to enabled services and custom combinations
browserAPI.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    if (changes.enabledServices) {
      console.log("Enabled services changed, updating context menus");
      enabledServices = changes.enabledServices.newValue;
      
      // Recreate context menus when settings change
      browserAPI.contextMenus.removeAll(() => {
        createContextMenus();
      });
    }
    
    if (changes.customCombinations) {
      console.log("Custom combinations changed, updating context menus");
      
      // Recreate context menus when combinations change
      browserAPI.contextMenus.removeAll(() => {
        createContextMenus();
      });
    }
  }
});

// Create context menu items
async function createContextMenus() {
  try {
    // First remove all existing context menus
    browserAPI.contextMenus.removeAll(async () => {
      console.log("Removed existing context menus");
      
      // Create parent context menu
      browserAPI.contextMenus.create({
        id: "soc-osint-parent",
        title: "SOC OSINT Search",
        contexts: ["selection"]
      });
      
      // Get custom combinations
      let customCombinations = [];
      try {
        if (browserAPI.storage.sync.get.length > 1) {
          // Chrome-style callback API
          browserAPI.storage.sync.get('customCombinations', function(data) {
            customCombinations = data.customCombinations || [];
            createMenuItems(customCombinations);
          });
        } else {
          // Firefox-style promise API
          const data = await browserAPI.storage.sync.get('customCombinations');
          customCombinations = data.customCombinations || [];
          createMenuItems(customCombinations);
        }
      } catch (error) {
        console.error("Error loading custom combinations:", error);
        createMenuItems([]);
      }
    });
  } catch (error) {
    console.error("Error in createContextMenus:", error);
  }
}

function createMenuItems(customCombinations) {
  // Create custom combinations first (if any)
  if (customCombinations && customCombinations.length > 0) {
    customCombinations.forEach((combo, index) => {
      browserAPI.contextMenus.create({
        id: `combo-${index}`,
        parentId: "soc-osint-parent",
        title: `⚡ ${combo.name}`,
        contexts: ["selection"]
      });
    });
    
    // Add separator
    browserAPI.contextMenus.create({
      id: "separator-1",
      parentId: "soc-osint-parent",
      type: "separator",
      contexts: ["selection"]
    });
  }
  
  // Create individual menu items for each enabled OSINT service
  for (const [service, enabled] of Object.entries(enabledServices)) {
    if (enabled) {
      browserAPI.contextMenus.create({
        id: `search-${service}`,
        parentId: "soc-osint-parent",
        title: service,
        contexts: ["selection"]
      });
    }
  }
  console.log("Context menus created successfully");
}

// IoC type detection
function detectIOCType(text) {
  // IP Address (IPv4)
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (ipv4Regex.test(text)) return 'ip';
  
  // IP Address (IPv6)
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  if (ipv6Regex.test(text)) return 'ip';
  
  // Hash (MD5, SHA1, SHA256)
  const hashRegex = /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/;
  if (hashRegex.test(text)) return 'hash';
  
  // URL
  const urlRegex = /^https?:\/\/.+/;
  if (urlRegex.test(text)) return 'url';
  
  // Domain
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.([a-zA-Z]{2,}\.?)+$/;
  if (domainRegex.test(text)) return 'domain';
  
  return 'unknown';
}

// Add IoC to history
async function addToHistory(ioc, tool, iocType) {
  console.log('Adding to history:', ioc, tool, iocType);
  
  const historyEntry = {
    ioc: ioc,
    tool: tool,
    type: iocType,
    timestamp: Date.now(),
    date: new Date().toLocaleString()
  };
  
  console.log('History entry created:', historyEntry);
  
  // Get existing history
  if (browserAPI.storage.sync.get.length > 1) {
    // Chrome callback API
    browserAPI.storage.sync.get('iocHistory', (data) => {
      console.log('Chrome API - Current history:', data);
      const history = data.iocHistory || [];
      
      // Add to beginning, limit to 100 entries
      history.unshift(historyEntry);
      if (history.length > 100) {
        history.splice(100);
      }
      
      console.log('Chrome API - Saving updated history:', history);
      browserAPI.storage.sync.set({ 'iocHistory': history }, () => {
        console.log('Chrome API - History saved successfully');
      });
    });
  } else {
    // Firefox promise API
    try {
      const data = await browserAPI.storage.sync.get('iocHistory');
      console.log('Firefox API - Current history:', data);
      const history = data.iocHistory || [];
      
      // Add to beginning, limit to 100 entries
      history.unshift(historyEntry);
      if (history.length > 100) {
        history.splice(100);
      }
      
      console.log('Firefox API - Saving updated history:', history);
      await browserAPI.storage.sync.set({ 'iocHistory': history });
      console.log('Firefox API - History saved successfully');
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  }
}

// Handle context menu clicks
browserAPI.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log("Context menu clicked:", info.menuItemId);
  const selectedText = info.selectionText.trim();
  
  if (info.menuItemId.startsWith("combo-")) {
    // Handle custom combination
    const comboIndex = parseInt(info.menuItemId.replace("combo-", ""));
    console.log("Running custom combination:", comboIndex);
    
    try {
      let customCombinations = [];
      if (browserAPI.storage.sync.get.length > 1) {
        // Chrome-style callback API
        browserAPI.storage.sync.get('customCombinations', function(data) {
          customCombinations = data.customCombinations || [];
          if (customCombinations[comboIndex]) {
            runCombination(customCombinations[comboIndex], selectedText);
          }
        });
      } else {
        // Firefox-style promise API
        const data = await browserAPI.storage.sync.get('customCombinations');
        customCombinations = data.customCombinations || [];
        if (customCombinations[comboIndex]) {
          runCombination(customCombinations[comboIndex], selectedText);
        }
      }
    } catch (error) {
      console.error("Error running combination:", error);
    }
  } else if (info.menuItemId.startsWith("search-")) {
    // Handle OSINT search
    const serviceName = info.menuItemId.replace("search-", "");
    
    if (serviceUrls[serviceName]) {
      const url = serviceUrls[serviceName].replace("[QUERY]", encodeURIComponent(selectedText));
      browserAPI.tabs.create({ url: url });
      
      // Add to history
      const iocType = detectIOCType(selectedText);
      addToHistory(selectedText, serviceName, iocType);
    }
  }
});

// Run a custom combination of tools
function runCombination(combination, selectedText) {
  console.log("Running combination:", combination.name, "with tools:", combination.tools);
  
  combination.tools.forEach(toolName => {
    if (serviceUrls[toolName]) {
      const url = serviceUrls[toolName].replace("[QUERY]", encodeURIComponent(selectedText));
      browserAPI.tabs.create({ url: url });
    }
  });
  
  // Add to history (using the combination name as the tool)
  const iocType = detectIOCType(selectedText);
  addToHistory(selectedText, combination.name, iocType);
}

// Listen for messages from popup (e.g., to update combinations)
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateCombinations') {
    console.log("Received request to update combinations");
    createContextMenus();
  }
});