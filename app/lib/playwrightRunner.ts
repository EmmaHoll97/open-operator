// playwrightRunner.ts
import { getSession, endSession } from './sessionManager';

type Method =
    | "GOTO"
    | "ACT"
    | "EXTRACT"
    | "OBSERVE"
    | "CLOSE"
    | "SCREENSHOT"
    | "WAIT"
    | "NAVBACK";

export async function runPlaywright({
    sessionID,
    method,
    instruction,
}: {
    sessionID: string;
    method: Method;
    instruction?: string;
}): Promise<any> {
    // Retrieve (or create) the session
    const { page } = getSession(sessionID);

    try {
        switch (method) {
            case "GOTO":
                if (!instruction) throw new Error("Missing URL in instruction");
                await page.goto(instruction, { waitUntil: "load", timeout: 60000 });
                break;

            case "ACT":
                if (!instruction) throw new Error("Missing action instruction");
                // Example: If your instruction is "click #submit", parse and perform it.
                // This is a naive implementation – adapt it based on your needs.
                if (instruction.startsWith("click")) {
                    const selector = instruction.replace("click", "").trim();
                    await page.click(selector);
                } else if (instruction.startsWith("type")) {
                    // e.g. "type #input Hello world"
                    const [, selector, ...textParts] = instruction.split(" ");
                    const text = textParts.join(" ");
                    await page.fill(selector, text);
                }
                break;

            case "EXTRACT":
                if (!instruction) throw new Error("Missing extraction instruction");
                // For example, extract the innerText of an element:
                return await page.$eval(instruction, (el) => el.textContent);

            case "OBSERVE":
                if (!instruction) throw new Error("Missing observation instruction");
                // Example: wait for a selector to appear (customize as needed)
                await page.waitForSelector(instruction, { timeout: 30000 });
                return { observed: instruction };

            case "SCREENSHOT":
                // Return screenshot as a base64 string
                return (await page.screenshot()).toString('base64');

            case "WAIT":
                if (!instruction) throw new Error("Missing wait duration");
                await page.waitForTimeout(Number(instruction));
                break;

            case "NAVBACK":
                await page.goBack();
                break;

            case "CLOSE":
                await endSession(sessionID);
                break;
        }
    } catch (error) {
        // On error, close the session to avoid leaking resources.
        await endSession(sessionID);
        throw error;
    }
}
