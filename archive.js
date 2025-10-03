// Browser API compatibility
const browserAPI = (() => {
  if (typeof browser !== 'undefined') {
    return browser;
  } else if (typeof chrome !== 'undefined') {
    return chrome;
  }
  return null;
})();

// Debug logging
console.log('Archive page loaded, browserAPI:', browserAPI);

let allHistory = [];
let currentFilter = 'all';

// Load and display full history
function loadHistory() {
  console.log('Archive: Loading history...');
  console.log('Archive: browserAPI available:', !!browserAPI);
  console.log('Archive: browserAPI.storage available:', !!(browserAPI && browserAPI.storage));
  console.log('Archive: browserAPI.storage.sync available:', !!(browserAPI && browserAPI.storage && browserAPI.storage.sync));
  
  if (!browserAPI) {
    console.error('Archive: Browser API not available');
    const container = document.getElementById('history-container');
    if (container) {
      container.innerHTML = '<div class="empty-state">Error: Browser API not available. This page must be opened from the extension.</div>';
    }
    return;
  }
  
  // Handle both Chrome (callback) and Firefox (promise) APIs
  try {
    const getMethod = browserAPI.storage.sync.get;
    console.log('Archive: storage.sync.get method:', typeof getMethod);
    console.log('Archive: storage.sync.get length:', getMethod.length);
    
    if (getMethod.length > 1) {
      // Chrome-style callback API
      console.log('Archive: Using Chrome-style callback API');
      browserAPI.storage.sync.get('iocHistory', function(data) {
        console.log('Archive Chrome API - Raw data received:', data);
        console.log('Archive Chrome API - data.iocHistory:', data.iocHistory);
        allHistory = data.iocHistory || [];
        console.log('Archive Chrome API - allHistory length:', allHistory.length);
        displayStats();
        displayHistory();
      });
    } else {
      // Firefox-style promise API
      console.log('Archive: Using Firefox-style promise API');
      browserAPI.storage.sync.get('iocHistory').then(function(data) {
        console.log('Archive Firefox API - Raw data received:', data);
        console.log('Archive Firefox API - data.iocHistory:', data.iocHistory);
        allHistory = data.iocHistory || [];
        console.log('Archive Firefox API - allHistory length:', allHistory.length);
        displayStats();
        displayHistory();
      }).catch(error => {
        console.error("Archive: Error loading history:", error);
        const container = document.getElementById('history-container');
        if (container) {
          container.innerHTML = '<div class="empty-state">Error loading history: ' + error.message + '</div>';
        }
      });
    }
  } catch (error) {
    console.error('Archive: Exception in loadHistory:', error);
    const container = document.getElementById('history-container');
    if (container) {
      container.innerHTML = '<div class="empty-state">Exception: ' + error.message + '</div>';
    }
  }
}

// Display statistics
function displayStats() {
  const statsContainer = document.getElementById('stats-container');
  const totalAnalyses = allHistory.length;
  
  if (totalAnalyses === 0) {
    statsContainer.innerHTML = `
      <div class="stat-item">
        <div class="stat-number">0</div>
        <div class="stat-label">Total Analyses</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">0</div>
        <div class="stat-label">IoC Types</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">-</div>
        <div class="stat-label">Most Used Tool</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">-</div>
        <div class="stat-label">Most Common Type</div>
      </div>
    `;
    return;
  }
  
  const typeStats = {};
  const toolStats = {};
  
  allHistory.forEach(item => {
    typeStats[item.type] = (typeStats[item.type] || 0) + 1;
    toolStats[item.tool] = (toolStats[item.tool] || 0) + 1;
  });
  
  const mostUsedTool = Object.keys(toolStats).reduce((a, b) => toolStats[a] > toolStats[b] ? a : b, '');
  const mostCommonType = Object.keys(typeStats).reduce((a, b) => typeStats[a] > typeStats[b] ? a : b, '');
  
  statsContainer.innerHTML = `
    <div class="stat-item">
      <div class="stat-number">${totalAnalyses}</div>
      <div class="stat-label">Total Analyses</div>
    </div>
    <div class="stat-item">
      <div class="stat-number">${Object.keys(typeStats).length}</div>
      <div class="stat-label">IoC Types</div>
    </div>
    <div class="stat-item">
      <div class="stat-number">${mostUsedTool}</div>
      <div class="stat-label">Most Used Tool</div>
    </div>
    <div class="stat-item">
      <div class="stat-number">${mostCommonType}</div>
      <div class="stat-label">Most Common Type</div>
    </div>
  `;
}

// Display history table
function displayHistory() {
  console.log('Archive: Displaying history, total items:', allHistory.length);
  const container = document.getElementById('history-container');
  
  if (!container) {
    console.error('Archive: history-container element not found!');
    return;
  }
  
  if (allHistory.length === 0) {
    console.log('Archive: No history to display');
    container.innerHTML = '<div class="empty-state">No analysis history found</div>';
    return;
  }
  
  console.log('Archive: Current filter:', currentFilter);
  
  const filteredHistory = currentFilter === 'all' 
    ? allHistory 
    : allHistory.filter(item => item.type === currentFilter);
  
  if (filteredHistory.length === 0) {
    container.innerHTML = '<div class="empty-state">No items match the current filter</div>';
    return;
  }
  
  let tableHTML = `
    <table class="history-table">
      <thead>
        <tr>
          <th>IoC</th>
          <th>Type</th>
          <th>Tool</th>
          <th>Date</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  filteredHistory.forEach((item, index) => {
    const typeColor = getTypeColor(item.type);
    const safeIoc = item.ioc.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const safeTool = item.tool.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    
    tableHTML += `
      <tr>
        <td class="ioc-cell" title="${safeIoc}">${safeIoc}</td>
        <td><span class="type-badge" style="background: ${typeColor};">${item.type}</span></td>
        <td class="tool-cell">${safeTool}</td>
        <td class="date-cell">${item.date}</td>
        <td><button class="action-btn" data-ioc="${safeIoc}" data-tool="${safeTool}" title="Re-analyze this IoC">Re-analyze</button></td>
      </tr>
    `;
  });
  
  tableHTML += '</tbody></table>';
  container.innerHTML = tableHTML;
  
  // Add click event listeners to all re-analyze buttons
  container.querySelectorAll('.action-btn').forEach(button => {
    button.addEventListener('click', function() {
      const ioc = this.getAttribute('data-ioc');
      const tool = this.getAttribute('data-tool');
      rerunAnalysis(ioc, tool);
    });
  });
}

// Filter by type
function filterByType(type, buttonElement) {
  console.log('Archive: Filtering by type:', type);
  currentFilter = type;
  
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  if (buttonElement) {
    buttonElement.classList.add('active');
  }
  
  displayHistory();
}

// Get type color
function getTypeColor(type) {
  const colors = {
    'ip': '#dc3545',
    'hash': '#6f42c1', 
    'domain': '#007bff',
    'url': '#28a745',
    'unknown': '#6c757d'
  };
  return colors[type] || colors.unknown;
}

// Re-run analysis
function rerunAnalysis(ioc, tool) {
  console.log('Rerunning analysis for:', ioc, 'with tool:', tool);
  
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
  
  if (serviceUrls[tool]) {
    const url = serviceUrls[tool].replace("[QUERY]", encodeURIComponent(ioc));
    console.log('Opening URL:', url);
    
    // Handle both Chrome (callback) and Firefox (promise) APIs
    if (browserAPI.tabs.create.length > 1) {
      // Chrome-style callback API
      browserAPI.tabs.create({ url: url }, function(tab) {
        console.log('Tab created:', tab);
      });
    } else {
      // Firefox-style promise API
      browserAPI.tabs.create({ url: url }).then(tab => {
        console.log('Tab created:', tab);
      }).catch(error => {
        console.error('Error creating tab:', error);
      });
    }
  } else {
    console.error('Unknown tool:', tool);
  }
}

// Clear all history
function clearHistory() {
  if (confirm('Are you sure you want to clear all analysis history? This cannot be undone.')) {
    // Handle both Chrome (callback) and Firefox (promise) APIs
    if (browserAPI.storage.sync.set.length > 1) {
      // Chrome-style callback API
      browserAPI.storage.sync.set({ 'iocHistory': [] }, function() {
        allHistory = [];
        displayStats();
        displayHistory();
      });
    } else {
      // Firefox-style promise API
      browserAPI.storage.sync.set({ 'iocHistory': [] }).then(() => {
        allHistory = [];
        displayStats();
        displayHistory();
      });
    }
  }
}

// Load history when page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('Archive: DOMContentLoaded event fired');
  
  // Add event listener to clear history button
  const clearBtn = document.getElementById('clear-history-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearHistory);
    console.log('Archive: Clear history button listener attached');
  }
  
  // Add event listeners to filter buttons
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', function() {
      const filterType = this.getAttribute('data-filter');
      filterByType(filterType, this);
    });
  });
  console.log('Archive: Filter button listeners attached');
  
  // Load history data
  loadHistory();
});

