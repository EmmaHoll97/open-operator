// sessionManager.ts
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { v4 as uuidv4 } from 'uuid';

export interface Session {
    browser: Browser;
    context: BrowserContext;
    page: Page;
}

// Simple in-memory sessions map. (For production, consider a persistent store.)
const sessions = new Map<string, Session>();

export async function createSession(): Promise<string> {
    const sessionId = uuidv4();
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    sessions.set(sessionId, { browser, context, page });
    return sessionId;
}

export async function endSession(sessionId: string): Promise<void> {
    const session = sessions.get(sessionId);
    if (session) {
        await session.context.close();
        await session.browser.close();
        sessions.delete(sessionId);
    }
}

export async function getDebugInfo(sessionId: string): Promise<{ screenshot?: string }> {
    const session = sessions.get(sessionId);
    if (session) {
        // For debugging, we can return a base64 screenshot of the current page.
        const screenshot = await session.page.screenshot({ encoding: 'base64' });
        return { screenshot };
    }
    return {};
}

export function getSession(sessionId: string): Session | undefined {
    return sessions.get(sessionId);
}
