// import type { Locator, TestInfo } from '@playwright/test';
// import type { Logger } from 'e2e/utils/playwright.logger';
// import type { WaitForOptions } from 'e2e/utils/playwright.models';

// export type AlertSeverity = 'error' | 'info' | 'warning' | 'success';

// export class MuiAlert {
//   constructor(
//     private root: Locator,
//     private logger: Logger,
//     private testInfo: TestInfo
//   ) {
//     this.logger.info('[MuiAlert] Constructor called');
//   }

//   async waitFor({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
//     this.logger.info(`[MuiAlert.waitFor] Waiting for alert. state="${state}", timeout=${timeout}`);
//     await this.root.waitFor({ state, timeout });
//     this.logger.info('[MuiAlert.waitFor] Wait completed');
//   }

//   async isVisible(timeout = 0): Promise<boolean> {
//     this.logger.info(`[MuiAlert.isVisible] Checking alert visibility. timeout=${timeout}`);
//     try {
//       const visible = await this.root.isVisible({ timeout });
//       this.logger.info(`[MuiAlert.isVisible] Result: ${visible}`);
//       return visible;
//     } catch {
//       this.logger.info('[MuiAlert.isVisible] Result: false (timeout or not in DOM)');
//       return false;
//     }
//   }

//   async getSeverity(): Promise<AlertSeverity> {
//     this.logger.info('[MuiAlert.getSeverity] Getting alert severity');
//     const classList = await this.root.evaluate(el => el.className);
//     this.logger.info(`[MuiAlert.getSeverity] classList="${classList}"`);
//     const level =
//       (['error', 'info', 'warning', 'success'] as const).find(l =>
//         classList.toLowerCase().includes(`alert-color${l}`.toLowerCase())
//       ) ?? 'info';
//     this.logger.info(`[MuiAlert.getSeverity] Detected level: ${level}`);
//     return level;
//   }

//   async getTextContent(): Promise<string> {
//     this.logger.info('[MuiAlert.getTextContent] Getting alert message text');
//     const textContent = await this.root.locator('.MuiAlert-message').innerText();
//     this.logger.info(`[MuiAlert.getTextContent] Detected text: "${textContent}"`);
//     return textContent;
//   }

//   async getAlertData(): Promise<{ level: AlertSeverity; textContent: string }> {
//     this.logger.info('[MuiAlert.getAlertData] Retrieving alert data');
//     await this.waitFor();
//     const level = await this.getSeverity();
//     const textContent = await this.getTextContent();
//     this.logger.info(`[MuiAlert.getAlertData] Result: level="${level}", text="${textContent}"`);
//     return { level, textContent };
//   }
// }

export const test2 = null;
