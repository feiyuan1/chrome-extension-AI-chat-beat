import { expect, test } from './fixture'
import {
  actionWithDelay,
  cleanTargetLog,
  findAIChatBeatExtensionWorker,
  getPlatformConfigs,
  Platform,
  TEST_IMAGE_PATH,
  TEST_PROMPT,
} from './utils'

const platformConfigs = getPlatformConfigs()

for (const platform of Object.values(Platform)) {
  test(`sends text + image message and reports AI tag on ${platform}`, async ({ page }) => {
    const { sessionUrl, selectors, uploadSuccess } = platformConfigs[platform]
    const worker = findAIChatBeatExtensionWorker(page.context())
    await actionWithDelay(() => page.goto(sessionUrl))
    const uploadSuccessSelector = uploadSuccess.image
    const uploadSuccessEl = page.locator(uploadSuccessSelector.selector)

    if (!(await uploadSuccessEl.count())) {
      if (selectors.addAttachment) {
        const addAttachmentEl = page.locator(selectors.addAttachment.selector)
        await addAttachmentEl.waitFor({ state: 'visible' })
        await addAttachmentEl.click()
      }

      const imageUpload = page.locator(selectors.imageUpload.selector)
      await imageUpload.waitFor({ state: 'attached' })
      if (await imageUpload.evaluate((el) => el.tagName === 'INPUT')) {
        await imageUpload.setInputFiles(TEST_IMAGE_PATH)
      } else {
        const [fileChooser] = await Promise.all([
          page.waitForEvent('filechooser'),
          imageUpload.click(),
        ])
        await fileChooser.setFiles(TEST_IMAGE_PATH)
      }
      await new Promise((res) => setTimeout(res, 3000000))
      await actionWithDelay(() => uploadSuccessEl.waitFor({ state: 'visible' }))
    }

    await cleanTargetLog(worker!)
    const input = page.locator(selectors.promptInput.selector)
    await input.waitFor({ state: 'visible' })
    await input.fill(TEST_PROMPT)
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
