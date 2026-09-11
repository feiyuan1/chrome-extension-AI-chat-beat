import { expect, test } from './fixture'
import {
  actionWithDelay,
  cleanTargetLog,
  collectConsoleMessages,
  getPlatformConfigs,
  Platform,
  TEST_IMAGE_PATH,
} from './utils'

const platformConfigs = getPlatformConfigs()

for (const platform of Object.values(Platform)) {
  test(`reports no valid prompt found for image-only message on ${platform}`, async ({ page }) => {
    test.setTimeout(300000)
    const { sessionUrl, selectors, uploadSuccess } = platformConfigs[platform]
    await actionWithDelay(() => page.goto(sessionUrl))
    await cleanTargetLog(page)
    const collector = collectConsoleMessages(page)

    const uploadSuccessSelector = uploadSuccess?.image
    const imageAlreadyUploaded = (await page.locator(uploadSuccessSelector.selector).count()) > 0

    if (!imageAlreadyUploaded) {
      if (selectors.addAttachment) {
        const addAttachmentEl = page.locator(selectors.addAttachment.selector)
        await addAttachmentEl.waitFor({ state: 'visible' })
        await addAttachmentEl.click()
      }

      const imageUpload = page.locator(selectors.imageUpload!.selector)
      await imageUpload.waitFor({ state: 'attached' })
      await expect(imageUpload).toHaveCount(1)

      if (await imageUpload.evaluate((el) => el.tagName === 'INPUT')) {
        await imageUpload.setInputFiles(TEST_IMAGE_PATH)
      } else {
        const [fileChooser] = await Promise.all([
          page.waitForEvent('filechooser'),
          imageUpload.click(),
        ])
        await fileChooser.setFiles(TEST_IMAGE_PATH)
      }
    }

    await actionWithDelay(() =>
      page.locator(uploadSuccessSelector.selector).waitFor({ state: 'visible' }),
    )
    const input = page.locator(selectors.promptInput.selector)
    await input.waitFor({ state: 'visible' })

    await new Promise((res) => setTimeout(res, 3000000))
    await Promise.all([
      page.waitForEvent('console', {
        predicate: (msg) => msg.text().includes('no valid prompt found'),
        timeout: 30000,
      }),
      input.press('Enter'),
    ])

    const consoleText = collector.getMessages().join('')
    expect(consoleText).toContain('no valid prompt found')

    collector.dispose()
  })
}
