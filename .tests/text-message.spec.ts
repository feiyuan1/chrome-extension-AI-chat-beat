import { expect, test } from './fixture'
import {
  actionWithDelay,
  cleanTargetLog,
  findAIChatBeatExtensionWorker,
  getPlatformConfigs,
  Platform,
  TEST_PROMPT,
} from './utils'

const platformConfigs = getPlatformConfigs()

for (const platform of Object.values(Platform)) {
  test(`sends text message and reports AI tag on ${platform}`, async ({ page }) => {
    const { sessionUrl, selectors } = platformConfigs[platform]
    const worker = findAIChatBeatExtensionWorker(page.context())

    await actionWithDelay(() => page.goto(sessionUrl))

    const input = page.locator(selectors.promptInput.selector)
    await input.waitFor({ state: 'visible' })
    await input.fill(TEST_PROMPT)

    await cleanTargetLog(worker!)
    const [log] = await Promise.all([
      worker!.waitForEvent('console', {
        predicate: (msg) => msg.text().includes(`\"_msg\":\"${TEST_PROMPT}\"`),
        timeout: 30000,
      }),
      input.press('Enter'),
    ])

    const text = log.text()
    expect(text).toContain('domain')
  })
}
