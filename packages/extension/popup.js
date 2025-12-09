// Popup script for extension settings

document.getElementById('save-btn').addEventListener('click', async () => {
  const token = document.getElementById('token-input').value.trim();
  const apiUrl = document.getElementById('api-url').value.trim();
  
  if (!token) {
    showStatus('Please enter a token', 'error');
    return;
  }
  
  // Save token
  chrome.storage.local.set({ 
    calendarai_token: token,
    calendarai_api_url: apiUrl || 'http://localhost:3001'
  }, () => {
    showStatus('Token saved! You can now use CalendarAI on Google Calendar.', 'success');
    
    // Send token to background
    chrome.runtime.sendMessage({
      type: 'AUTH_TOKEN',
      token: token
    });
  });
});

// Load saved token
chrome.storage.local.get(['calendarai_token', 'calendarai_api_url'], (result) => {
  if (result.calendarai_token) {
    document.getElementById('token-input').value = result.calendarai_token;
  }
  if (result.calendarai_api_url) {
    document.getElementById('api-url').value = result.calendarai_api_url;
  }
});

function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  setTimeout(() => {
    statusDiv.textContent = '';
    statusDiv.className = '';
  }, 3000);
}

