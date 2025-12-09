// Background service worker for CalendarAI extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('CalendarAI extension installed');
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'AUTH_TOKEN') {
    // Store auth token
    chrome.storage.local.set({ calendarai_token: request.token });
    sendResponse({ success: true });
  }
});

// Listen for navigation to Google Calendar
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('calendar.google.com')) {
    // Inject content script if needed
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    }).catch(() => {
      // Already injected or error
    });
  }
});

