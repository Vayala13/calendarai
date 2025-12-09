// Content script to inject CalendarAI chatbot into Google Calendar

(function() {
  'use strict';

  // Check if chatbot is already injected
  if (document.getElementById('calendarai-chatbot-root')) {
    return;
  }

  // Create chatbot container
  const chatbotContainer = document.createElement('div');
  chatbotContainer.id = 'calendarai-chatbot-root';
  chatbotContainer.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Inject chatbot iframe
  const chatbotIframe = document.createElement('iframe');
  chatbotIframe.id = 'calendarai-chatbot-iframe';
  chatbotIframe.src = chrome.runtime.getURL('chatbot.html');
  chatbotIframe.style.cssText = `
    width: 420px;
    height: 600px;
    border: none;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    background: white;
    display: none;
  `;

  // Create toggle button
  const toggleButton = document.createElement('button');
  toggleButton.id = 'calendarai-toggle-btn';
  toggleButton.innerHTML = '✨';
  toggleButton.style.cssText = `
    width: 56px;
    height: 56px;
    border-radius: 16px;
    border: none;
    background: linear-gradient(135deg, #D97757 0%, #C4593D 100%);
    color: white;
    font-size: 1.4rem;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(217, 119, 87, 0.35);
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  toggleButton.addEventListener('mouseenter', () => {
    toggleButton.style.transform = 'scale(1.08)';
    toggleButton.style.boxShadow = '0 6px 28px rgba(217, 119, 87, 0.45)';
  });

  toggleButton.addEventListener('mouseleave', () => {
    toggleButton.style.transform = 'scale(1)';
    toggleButton.style.boxShadow = '0 4px 20px rgba(217, 119, 87, 0.35)';
  });

  let isOpen = false;

  toggleButton.addEventListener('click', () => {
    isOpen = !isOpen;
    if (isOpen) {
      chatbotIframe.style.display = 'block';
      toggleButton.style.display = 'none';
    } else {
      chatbotIframe.style.display = 'none';
      toggleButton.style.display = 'flex';
    }
  });

  // Close button inside iframe (handled via postMessage)
  window.addEventListener('message', (event) => {
    if (event.data.type === 'CALENDARAI_CLOSE') {
      isOpen = false;
      chatbotIframe.style.display = 'none';
      toggleButton.style.display = 'flex';
    }
    
    // Forward Google Calendar events to chatbot
    if (event.data.type === 'CALENDARAI_GET_EVENTS') {
      getGoogleCalendarEvents().then(events => {
        chatbotIframe.contentWindow.postMessage({
          type: 'CALENDARAI_EVENTS',
          events: events
        }, '*');
      });
    }
    
    // Refresh calendar when events are added/removed
    if (event.data.type === 'CALENDARAI_REFRESH') {
      // Reload the page to show updated calendar
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  });

  // Function to extract events from Google Calendar DOM
  async function getGoogleCalendarEvents() {
    const events = [];
    
    // Try to find events in the current view
    const eventElements = document.querySelectorAll('[data-eventid], [data-event-id]');
    
    eventElements.forEach((el, index) => {
      try {
        const title = el.textContent?.trim() || el.getAttribute('title') || 'Untitled Event';
        const timeMatch = el.textContent?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        
        events.push({
          id: el.getAttribute('data-eventid') || el.getAttribute('data-event-id') || `event-${index}`,
          title: title,
          time: timeMatch ? timeMatch[0] : null,
          element: el
        });
      } catch (e) {
        console.error('Error extracting event:', e);
      }
    });
    
    return events;
  }

  // Assemble and inject
  chatbotContainer.appendChild(chatbotIframe);
  chatbotContainer.appendChild(toggleButton);
  document.body.appendChild(chatbotContainer);

  // Listen for calendar changes and notify chatbot
  const observer = new MutationObserver(() => {
    if (isOpen) {
      getGoogleCalendarEvents().then(events => {
        chatbotIframe.contentWindow.postMessage({
          type: 'CALENDARAI_EVENTS_UPDATE',
          events: events
        }, '*');
      });
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('✅ CalendarAI chatbot injected into Google Calendar');
})();

