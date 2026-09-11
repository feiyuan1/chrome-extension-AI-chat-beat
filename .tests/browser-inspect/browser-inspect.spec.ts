import path from 'path'
import platformSelectorJson from '../diff-in-multi-platform.json' with { type: 'json' }
import { actionWithDelay, findTargetSession, Platform } from '../utils'
import { expect, test } from './fixture'

test('platforms in platformSelectorJson is not empty', () => {
  expect(platformSelectorJson?.platforms).toBeTruthy()
  expect(platformSelectorJson.platforms?.length).toBeTruthy()
})

platformSelectorJson.platforms.forEach((pf) => {
  const { platform, selectors, uploadSuccess } = pf
  const sessionUrl = findTargetSession(platform as Platform)
  if (!sessionUrl) {
    throw new Error(`platformJson missing required ${platform} field`)
  }

  test(`promptInput selector is usable for ${platform}`, async ({ page }) => {
    const selector = selectors['promptInput'].selector
    expect(selector).toBeTruthy()
    await page.goto(sessionUrl)
    const input = page.locator(selector)
    await input.waitFor({ state: 'visible' })
    await expect(input).toHaveCount(1)
    await input.fill('test promptInput selector')
    const isOriginInput = await input.evaluate((el) => {
      return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
    })
    if (isOriginInput) {
      await expect(input).toHaveValue('test promptInput selector')
      return
    }
    await expect(input).toContainText('test promptInput selector')
  })

  test(`addAttachment element can be located for ${platform}`, async ({ page }) => {
    const addAttachment = selectors['addAttachment']
    await page.goto(sessionUrl)
    if (!addAttachment) {
      return
    }
    const addAttachmentEl = page.locator(addAttachment.selector)
    await addAttachmentEl.waitFor({ state: 'visible' })
    await expect(addAttachmentEl).toHaveCount(1)
  })

  test(`imageupload selector is not empty for ${platform}`, async ({ page }) => {
    const selector = selectors['imageUpload']
    expect(selector).toBeTruthy()
  })

  test(`click addAttachment should show imageUpload element for ${platform}`, async ({ page }) => {
    const addAttachment = selectors['addAttachment']
    await actionWithDelay(() => page.goto(sessionUrl))
    if (!addAttachment) {
      return
    }
    const selector = selectors['imageUpload']
    const addAttachmentEl = page.locator(addAttachment.selector)
    await addAttachmentEl.waitFor({ state: 'visible' })
    const imageUpload = page.locator(selector.selector)
    await addAttachmentEl.click()
    await expect(imageUpload).toHaveCount(1)
  })

  test(`imageUpload element is not empty and can setInputFiles for ${platform}`, async ({
    page,
  }) => {
    const addAttachment = selectors['addAttachment']
    await actionWithDelay(() => page.goto(sessionUrl))
    if (platform === Platform.yiyan) {
      await new Promise((res) => setTimeout(res, 3000))
    }
    if (addAttachment) {
      const addAttachmentEl = page.locator(addAttachment.selector)
      await addAttachmentEl.waitFor({ state: 'visible' })
      await addAttachmentEl.click()
    }
    const selector = selectors['imageUpload']
    const imageUpload = page.locator(selector.selector)
    console.log('imageupload selector', selector.selector)
    console.log('imageUpload count', await imageUpload.count())
    await imageUpload.waitFor({ state: 'attached' })
    await expect(imageUpload).toHaveCount(1)
    if (await imageUpload.evaluate((el) => el.tagName === 'INPUT')) {
      await imageUpload.setInputFiles(path.join(process.cwd(), '.tests/assets/image.png'))
      return
    }
    const [fileChooser] = await Promise.all([page.waitForEvent('filechooser'), imageUpload.click()])
    await fileChooser.setFiles(path.join(process.cwd(), '.tests/assets/image.png'))
    expect(fileChooser).toBeTruthy()
  })

  test(`after upload image, image uploadsuccess element should be visible for ${platform}`, async ({
    page,
  }) => {
    const uploadSuccessSelector = uploadSuccess?.image
    expect(uploadSuccessSelector).toBeTruthy()
    const addAttachment = selectors['addAttachment']
    await actionWithDelay(() => page.goto(sessionUrl))
    if (addAttachment) {
      const addAttachmentEl = page.locator(addAttachment.selector)
      await addAttachmentEl.waitFor({ state: 'visible' })
      await addAttachmentEl.click()
    }
    const selector = selectors['imageUpload']
    const imageUpload = page.locator(selector.selector)
    await imageUpload.waitFor({ state: 'attached' })
    if (await imageUpload.evaluate((el) => el.tagName === 'INPUT')) {
      await imageUpload.setInputFiles(path.join(process.cwd(), '.tests/assets/image.png'))
    } else {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        imageUpload.click(),
      ])
      await fileChooser.setFiles(path.join(process.cwd(), '.tests/assets/image.png'))
    }
    const uploadImageSuccess = page.locator(uploadSuccessSelector.selector)
    await uploadImageSuccess.waitFor({ state: 'visible' })
  })
})
