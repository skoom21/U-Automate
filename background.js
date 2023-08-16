let intervalId;


function reloadPageAndCheckChanges(electives) {
  clearInterval(intervalId);
  
  intervalId = setInterval(() => {
     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      chrome.tabs.reload(tabId);
      
      // Send a message to content script after the page reloads
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (changeInfo.status === 'complete' && tabId === tabs[0].id) {
          chrome.tabs.sendMessage(tabId, { action: 'checkChanges', electives });
          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
    });
  }, 5000); // Reload every 5 seconds
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'stopAutomation') {
    clearInterval(intervalId);
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'startAutomation') {
    reloadPageAndCheckChanges(message.electives);
  }
});

