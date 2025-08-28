let intervalId; // Fixed variable name consistency

function reloadPageAndCheckChanges(electives) {
  clearInterval(intervalId);
  
  intervalId = setInterval(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      
      const tabId = tabs[0].id;
      chrome.tabs.reload(tabId);
      
      // Create a one-time listener for this specific reload
      const listener = (updatedTabId, changeInfo) => {
        if (changeInfo.status === 'complete' && updatedTabId === tabId) {
          chrome.tabs.onUpdated.removeListener(listener);
          
          // Add a small delay to ensure page is fully loaded
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, { 
              action: 'checkChanges', 
              electives 
            }).catch(err => {
              console.log('Failed to send message to content script:', err);
            });
          }, 1000);
        }
      };
      
      chrome.tabs.onUpdated.addListener(listener);
      
      // Cleanup listener after 10 seconds to prevent memory leaks
      setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(listener);
      }, 10000);
    });
  }, 5000);
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'stopAutomation') {
    clearInterval(intervalId);
    console.log('Automation stopped');
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'startAutomation') {
    console.log('Starting automation with electives:', message.electives);
    reloadPageAndCheckChanges(message.electives);
  }
});