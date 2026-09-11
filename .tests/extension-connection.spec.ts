import { test } from './fixture'
import {
  actionWithDelay,
  cleanTargetLog,
  findAIChatBeatExtensionWorker,
  getPlatformConfigs,
  Platform,
} from './utils'

const platformConfigs = getPlatformConfigs()

for (const platform of Object.values(Platform)) {
  test(`extension connects on ${platform}`, async ({ page }) => {
    const { sessionUrl } = platformConfigs[platform]
    const worker = findAIChatBeatExtensionWorker(page.context())
    await cleanTargetLog(worker!)
    await Promise.all([
      worker!.waitForEvent('console', {
        predicate: (msg) => msg.text().includes('sw timestamp'),
        timeout: 30000,
      }),
      actionWithDelay(() => page.goto(sessionUrl)),
    ])
  })
}
