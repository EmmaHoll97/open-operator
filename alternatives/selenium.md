## Selenium WebDriver Actions for JavaScript

This documentation outlines simplified Selenium WebDriver actions for JavaScript, designed to provide full browser control for LLM-based web automation agents.

### GOTO

Navigate to a specified URL.

```javascript
const goto = async (driver, url) => {
  await driver.get(url);
};
```

Usage:
```javascript
await goto(driver, 'https://example.com');
```

### ACT

Perform actions on web elements, such as clicking or typing.

```javascript
const act = async (driver, selector, action, value = null) => {
  const element = await driver.findElement(By.css(selector));
  switch (action) {
    case 'click':
      await element.click();
      break;
    case 'type':
      await element.sendKeys(value);
      break;
    // Add more actions as needed
  }
};
```

Usage:
```javascript
await act(driver, '#submit-button', 'click');
await act(driver, '#search-input', 'type', 'Selenium WebDriver');
```

### EXTRACT

Extract information from web elements.

```javascript
const extract = async (driver, selector, attribute = 'textContent') => {
  const element = await driver.findElement(By.css(selector));
  return await element.getAttribute(attribute);
};
```

Usage:
```javascript
const text = await extract(driver, '#main-content');
const href = await extract(driver, 'a.link', 'href');
```

### OBSERVE

Check for the presence or state of elements on the page.

```javascript
const observe = async (driver, selector, condition = 'present') => {
  const element = await driver.findElement(By.css(selector));
  switch (condition) {
    case 'present':
      return await element.isDisplayed();
    case 'enabled':
      return await element.isEnabled();
    // Add more conditions as needed
  }
};
```

Usage:
```javascript
const isVisible = await observe(driver, '#popup');
const isEnabled = await observe(driver, '#submit-button', 'enabled');
```

### CLOSE

Close the current browser window or tab.

```javascript
const close = async (driver) => {
  await driver.close();
};
```

Usage:
```javascript
await close(driver);
```

### WAIT

Wait for a specific condition to be met before proceeding.

```javascript
const wait = async (driver, selector, condition = 'visible', timeout = 10000) => {
  await driver.wait(until.elementLocated(By.css(selector)), timeout);
  const element = await driver.findElement(By.css(selector));
  switch (condition) {
    case 'visible':
      await driver.wait(until.elementIsVisible(element), timeout);
      break;
    case 'clickable':
      await driver.wait(until.elementIsEnabled(element), timeout);
      break;
    // Add more conditions as needed
  }
};
```

Usage:
```javascript
await wait(driver, '#dynamic-content', 'visible');
await wait(driver, '#submit-button', 'clickable', 5000);
```

### NAVBACK

Navigate back to the previous page in the browser history.

```javascript
const navback = async (driver) => {
  await driver.navigate().back();
};
```

Usage:
```javascript
await navback(driver);
```

These simplified Selenium WebDriver actions provide a foundation for LLM-based agents to interact with web browsers effectively. By using these abstracted methods, agents can perform common web automation tasks without needing to understand the intricacies of Selenium's API[1][2][3].

Citations:
[1] https://github.com/moll/node-selenium-dom/blob/master/doc/API.md
[2] https://dev.to/jhk_info/javascript-and-selenium-integration-streamlining-your-web-automation-3chk
[3] https://developer.evinced.com/sdks-for-web-apps/selenium-js-sdk/
[4] https://www.browserstack.com/guide/javascriptexecutor-in-selenium
[5] https://github.com/dalenguyen/selenium-javascript/blob/master/docs/getting-started.md
[6] https://www.browserstack.com/guide/how-to-handle-dynamic-elements-in-selenium
[7] https://selenium-python.readthedocs.io/api.html
[8] https://stackoverflow.com/questions/11947832/how-to-click-an-element-in-selenium-webdriver-using-javascript


# Session Handler

import http from "http";
import { Builder } from "selenium-webdriver";

class BrowserbaseSessionHandler {
  constructor(apiKey, projectId) {
    this.apiKey = apiKey;
    this.projectId = projectId;
    this.session = null;
  }

  async createSession() {
    // Simulating session creation
    this.session = {
      id: Math.random().toString(36).substring(7),
      signingKey: Math.random().toString(36).substring(7),
      seleniumRemoteUrl: "http://localhost:4444/wd/hub"
    };
    console.log(`Session created, id: ${this.session.id}`);
  }

  getCustomHttpAgent() {
    const customHttpAgent = new http.Agent({});
    customHttpAgent.addRequest = (req, options) => {
      req.setHeader("x-bb-signing-key", this.session.signingKey);
      (http.Agent.prototype).addRequest.call(customHttpAgent, req, options);
    };
    return customHttpAgent;
  }

  async buildDriver() {
    if (!this.session) {
      await this.createSession();
    }

    console.log("Starting remote browser...");
    const driver = new Builder()
      .forBrowser("chrome")
      .usingHttpAgent(this.getCustomHttpAgent())
      .usingServer(this.session.seleniumRemoteUrl)
      .build();

    return driver;
  }

  async debugSession() {
    // Simulating debug URL generation
    const debugUrl = `https://browserbase.com/debug/${this.session.id}`;
    console.log(`Session started, live debug accessible here: ${debugUrl}`);
  }

  async endSession(driver) {
    console.log("Shutting down...");
    await driver.quit();
    console.log(`Session complete! View replay at https://browserbase.com/sessions/${this.session.id}`);
  }
}

// Usage example
async function runTest() {
  const handler = new BrowserbaseSessionHandler("your_api_key", "your_project_id");
  const driver = await handler.buildDriver();

  try {
    await driver.get("https://www.example.com");
    await handler.debugSession();
    console.log("Taking a screenshot!");
    await driver.takeScreenshot();
  } finally {
    await handler.endSession(driver);
  }
}

runTest().catch(console.error);
