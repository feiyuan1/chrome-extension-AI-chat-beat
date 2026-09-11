import { test as base, chromium, type BrowserContext, type Page } from '@playwright/test'
import os from 'os'
import path from 'path'
import process from 'process'

export const test = base.extend<{ page: Page }, { loginContext: BrowserContext }>({
  loginContext: [
    async ({}, use) => {
      const userDataDir = path.join(os.tmpdir(), 'playwright-user-data-dir')
      console.log('user data dir', userDataDir)
      const browserContext = await chromium.launchPersistentContext(userDataDir, {
        channel: 'chromium',
      })

      console.log(`[Worker PID: ${process.pid}] ext loading..`)
      await use(browserContext)
      console.log(`[Worker PID: ${process.pid}] before close browser context`)
      await browserContext.close()
    },
    { scope: 'worker' },
  ],
  page: async ({ loginContext }, use) => {
    console.log('new page...')
    // 为每个测试用例打开一个新标签页
    const page = await loginContext.newPage()

    await use(page)
    // 用例结束后仅关闭当前标签页，不影响共享的 Context
    await page.close()
    console.log('close page')
  },
})

export { expect } from '@playwright/test'
