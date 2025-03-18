document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  const servicesContainer = document.getElementById('services-container');
  const resetServicesButton = document.getElementById('reset-services');
  
  // Service URLs for reference (same as in background.js)
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
  
  // Default services
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
  
  // Load current enabled services
  function loadServices() {
    chrome.storage.sync.get('enabledServices', function(data) {
      const enabledServices = data.enabledServices || defaultServices;
      
      // Clear container
      servicesContainer.innerHTML = '';
      
      // Create toggle switches for each service
      for (const [service, url] of Object.entries(serviceUrls)) {
        const serviceDiv = document.createElement('div');
        serviceDiv.className = 'service-toggle';
        
        const label = document.createElement('label');
        label.textContent = service;
        
        const switchLabel = document.createElement('label');
        switchLabel.className = 'switch';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = enabledServices[service] || false;
        checkbox.dataset.service = service;
        
        const slider = document.createElement('span');
        slider.className = 'slider';
        
        switchLabel.appendChild(checkbox);
        switchLabel.appendChild(slider);
        
        serviceDiv.appendChild(label);
        serviceDiv.appendChild(switchLabel);
        
        servicesContainer.appendChild(serviceDiv);
        
        // Add change listener for each checkbox
        checkbox.addEventListener('change', function() {
          updateEnabledServices();
        });
      }
    });
  }
  
  // Save changes when checkboxes are toggled
  function updateEnabledServices() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][data-service]');
    const enabledServices = {};
    
    checkboxes.forEach(checkbox => {
      enabledServices[checkbox.dataset.service] = checkbox.checked;
    });
    
    chrome.storage.sync.set({ 'enabledServices': enabledServices });
  }
  
  // Reset services to defaults
  if (resetServicesButton) {
    resetServicesButton.addEventListener('click', function() {
      chrome.storage.sync.set({ 'enabledServices': defaultServices }, function() {
        loadServices();
      });
    });
  }
  
  // Initial load
  loadServices();
  
  // Clean up any old Quick Find targets data (no longer needed)
  chrome.storage.sync.remove('quickFindTargets');
});