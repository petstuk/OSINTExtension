// Firefox compatibility polyfill (simplified version for this extension)
if (typeof browser === 'undefined') {
    var browser = chrome;
  }
  
  // Use browser API for Firefox extension
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
  function initializeExtension() {
    console.log("Initializing extension");
    
    // Set default enabled services
    browser.storage.sync.get('enabledServices').then((data) => {
      if (!data.enabledServices) {
        console.log("Setting default enabled services");
        browser.storage.sync.set({ 'enabledServices': defaultServices }).then(() => {
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
      // Fallback to default services if there's an error
      enabledServices = defaultServices;
      createContextMenus();
    });
  }
  
  // Run on startup
  initializeExtension();
  
  // Also run on installed
  browser.runtime.onInstalled.addListener(() => {
    console.log("Extension installed or updated");
    initializeExtension();
  });
  
  // Listen for changes to enabled services
  browser.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.enabledServices) {
      console.log("Enabled services changed, updating context menus");
      enabledServices = changes.enabledServices.newValue;
      
      // Recreate context menus when settings change
      browser.contextMenus.removeAll().then(() => {
        createContextMenus();
      });
    }
  });
  
  // Create context menu items
  function createContextMenus() {
    try {
      // First remove all existing context menus
      browser.contextMenus.removeAll().then(() => {
        console.log("Removed existing context menus");
        
        // Create parent context menu
        browser.contextMenus.create({
          id: "soc-osint-parent",
          title: "SOC OSINT Search",
          contexts: ["selection"]
        });
        
        // Create Microsoft Apps search menu item
        browser.contextMenus.create({
          id: "microsoft-apps-search",
          parentId: "soc-osint-parent",
          title: "Microsoft Apps",
          contexts: ["selection"]
        });
        
        // Create individual menu items for each enabled OSINT service
        for (const [service, enabled] of Object.entries(enabledServices)) {
          if (enabled) {
            browser.contextMenus.create({
              id: `search-${service}`,
              parentId: "soc-osint-parent",
              title: service,
              contexts: ["selection"]
            });
          }
        }
        console.log("Context menus created successfully");
      }).catch(error => {
        console.error("Error removing context menus:", error);
      });
    } catch (error) {
      console.error("Error in createContextMenus:", error);
    }
  }
  
  // Handle context menu clicks
  browser.contextMenus.onClicked.addListener((info, tab) => {
    console.log("Context menu clicked:", info.menuItemId);
    const selectedText = info.selectionText.trim();
    
    if (info.menuItemId === "microsoft-apps-search") {
      console.log("Microsoft Apps search clicked, text:", selectedText);
      
      // Open Microsoft Apps page
      browser.tabs.create({ url: MICROSOFT_APPS_URL }).then((newTab) => {
        console.log("Microsoft Apps page opened, tab ID:", newTab.id);
        
        // Wait for the page to load before attempting to search
        browser.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tab) {
          if (tabId === newTab.id && changeInfo.status === 'complete') {
            console.log("Microsoft Apps page loaded, executing search");
            browser.tabs.onUpdated.removeListener(listener);
            
            // Execute search with Firefox API
            browser.tabs.executeScript(newTab.id, {
              code: `(${performSearch.toString()})(${JSON.stringify(selectedText)})`
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
        browser.tabs.create({ url: url });
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