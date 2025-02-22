## Puppeteer Action Documentation

This documentation outlines simplified interactions for controlling a browser using Puppeteer, designed for integration with an LLM-powered agent. Each action is represented by a specific tool that encapsulates common browser operations.

### GOTO

The GOTO tool navigates the browser to a specified URL.

```javascript
async function goto(page, url) {
  await page.goto(url, { waitUntil: 'networkidle0' });
}
```

Usage:
```javascript
await goto(page, 'https://example.com');
```

### ACT

The ACT tool performs actions on the page, such as clicking elements or typing text.

```javascript
async function act(page, action, selector, value = null) {
  switch (action) {
    case 'click':
      await page.click(selector);
      break;
    case 'type':
      await page.type(selector, value);
      break;
    // Add more actions as needed
  }
}
```

Usage:
```javascript
await act(page, 'click', '#submit-button');
await act(page, 'type', '#search-input', 'Puppeteer');
```

### EXTRACT

The EXTRACT tool retrieves data from the page.

```javascript
async function extract(page, selector, attribute = null) {
  if (attribute) {
    return page.$eval(selector, (el, attr) => el.getAttribute(attr), attribute);
  }
  return page.$eval(selector, el => el.textContent);
}
```

Usage:
```javascript
const text = await extract(page, '.article-title');
const href = await extract(page, 'a.link', 'href');
```

### OBSERVE

The OBSERVE tool waits for specific events or elements on the page.

```javascript
async function observe(page, event, options = {}) {
  switch (event) {
    case 'load':
      await page.waitForNavigation({ waitUntil: 'load' });
      break;
    case 'networkIdle':
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      break;
    case 'selector':
      await page.waitForSelector(options.selector);
      break;
    // Add more events as needed
  }
}
```

Usage:
```javascript
await observe(page, 'load');
await observe(page, 'selector', { selector: '#dynamic-content' });
```

### CLOSE

The CLOSE tool closes the current page or the entire browser.

```javascript
async function close(browser, page = null) {
  if (page) {
    await page.close();
  } else {
    await browser.close();
  }
}
```

Usage:
```javascript
await close(browser, page); // Close a specific page
await close(browser); // Close the entire browser
```

### WAIT

The WAIT tool introduces a delay in the execution.

```javascript
async function wait(duration) {
  return new Promise(resolve => setTimeout(resolve, duration));
}
```

Usage:
```javascript
await wait(2000); // Wait for 2 seconds
```

### NAVBACK

The NAVBACK tool navigates back to the previous page in the browser history.

```javascript
async function navback(page) {
  await page.goBack();
}
```

Usage:
```javascript
await navback(page);
```

These simplified interactions provide a foundation for an LLM-powered agent to control a browser using Puppeteer. By using these tools, the agent can perform common web actions while maintaining full control over the browser[1][5][8].

Citations:
[1] https://pptr.dev/guides/javascript-execution
[2] https://www.roborabbit.com/blog/mastering-puppeteer-tips-and-tricks-for-effortless-web-automation/
[3] https://docs.apify.com/sdk/js/docs/2.3/api/puppeteer
[4] https://inside.caratlane.com/puppeteer-in-action-the-ultimate-guide-to-web-automation-and-performance-testing-612d9864c84a
[5] https://pptr.dev/guides/what-is-puppeteer
[6] https://www.browserstack.com/guide/puppeteer-click-button
[7] https://www.restack.io/p/puppeteer-knowledge-puppeteer-js-documentation
[8] https://pptr.dev/guides/page-interactions
[9] https://github.com/puppeteer/puppeteer/blob/main/docs/api/puppeteer.page.md

# Session Handling 

To create a complete clone of Browserbase's session handler for Puppeteer, we'll need to implement several key features. Here's a comprehensive implementation that mimics the core functionality:

```javascript
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class SessionHandler {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.sessions = new Map();
  }

  async createSession(options = {}) {
    const sessionId = Math.random().toString(36).substring(7);
    const userDataDir = path.join(__dirname, 'sessions', sessionId);
    
    const browser = await puppeteer.launch({
      headless: false,
      userDataDir,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      ...options
    });

    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();

    this.sessions.set(sessionId, { browser, context, page, userDataDir });

    return sessionId;
  }

  async getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  async closeSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      await session.browser.close();
      await fs.rmdir(session.userDataDir, { recursive: true });
      this.sessions.delete(sessionId);
    }
  }

  async saveCookies(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      const cookies = await session.page.cookies();
      await fs.writeFile(
        path.join(session.userDataDir, 'cookies.json'),
        JSON.stringify(cookies)
      );
    }
  }

  async loadCookies(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      const cookiesPath = path.join(session.userDataDir, 'cookies.json');
      const cookiesString = await fs.readFile(cookiesPath, 'utf8');
      const cookies = JSON.parse(cookiesString);
      await session.page.setCookie(...cookies);
    }
  }

  async executeScript(sessionId, script) {
    const session = this.sessions.get(sessionId);
    if (session) {
      return await session.page.evaluate(script);
    }
  }

  async takeScreenshot(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      return await session.page.screenshot();
    }
  }

  async navigateTo(sessionId, url) {
    const session = this.sessions.get(sessionId);
    if (session) {
      await session.page.goto(url, { waitUntil: 'networkidle0' });
    }
  }
}

module.exports = SessionHandler;
```

This SessionHandler class provides the following functionality:

1. **Session Creation**: Creates a new browser session with a unique ID and user data directory[1][4].

2. **Session Retrieval**: Allows fetching an existing session by its ID[2].

3. **Session Closure**: Closes a session and cleans up its resources[4].

4. **Cookie Management**: Saves and loads cookies for persistence across sessions[5][8].

5. **Script Execution**: Executes JavaScript within the context of a session[2].

6. **Screenshot Capture**: Takes screenshots of the current page in a session[2].

7. **Navigation**: Navigates to a specified URL within a session[2].

To use this SessionHandler, you would do something like this:

```javascript
const SessionHandler = require('./SessionHandler');

(async () => {
  const handler = new SessionHandler('your_api_key_here');
  
  // Create a new session
  const sessionId = await handler.createSession();
  
  // Navigate to a website
  await handler.navigateTo(sessionId, 'https://example.com');
  
  // Execute some JavaScript
  const title = await handler.executeScript(sessionId, () => document.title);
  console.log('Page title:', title);
  
  // Take a screenshot
  const screenshot = await handler.takeScreenshot(sessionId);
  
  // Save cookies
  await handler.saveCookies(sessionId);
  
  // Close the session
  await handler.closeSession(sessionId);
})();
```

This implementation provides a robust foundation for managing Puppeteer sessions, similar to Browserbase's functionality. It includes features for session isolation, cookie persistence, and common browser operations[1][2][4][5][8]. You can extend this further by adding proxy support, more advanced fingerprinting techniques, or integrating with a cloud-based solution for distributed session management.

Citations:
[1] https://webscraping.ai/faq/puppeteer/how-to-handle-browser-sessions-in-puppeteer
[2] https://www.restack.io/p/puppeteer-session-management-answer
[3] https://docs.browserbase.com/features/sessions
[4] https://www.browserless.io/blog/manage-sessions
[5] https://stackoverflow.com/questions/57987585/puppeteer-how-to-store-a-session-including-cookies-page-state-local-storage
[6] https://github.com/puppeteer/puppeteer/issues/85
[7] https://docs.browserbase.com/quickstart/puppeteer
[8] https://scrapingant.com/blog/puppeteer-local-storage
[9] https://scrapeops.io/puppeteer-web-scraping-playbook/nodejs-puppeteer-managing-cookies/