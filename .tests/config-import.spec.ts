import { readFileSync } from 'fs'
import path from 'path'
import { expect, test } from './fixture'
import { getPopupUrl } from './utils'

test('popup imports and persists label model config', async ({ page }) => {
  const popupUrl = getPopupUrl()

  page.on('dialog', (dialog) => dialog.accept())

  const configPath = path.resolve(process.cwd(), 'config/label-model.local.json')
  const config = JSON.parse(readFileSync(configPath, 'utf-8'))

  await page.goto(popupUrl)

  await Promise.all([
    page.waitForEvent('dialog'),
    page.locator('#config-import-file').setInputFiles(configPath),
  ])

  await expect(page.locator('#config-base-url')).toHaveValue(config.baseUrl)
  await expect(page.locator('#config-model')).toHaveValue(config.model)
  await expect(page.locator('#config-timeout')).toHaveValue(String(config.timeoutMs))
  await expect(page.locator('#config-api-key')).toHaveValue(config.apiKey)

  await Promise.all([
    page.waitForEvent('dialog'),
    page.locator('#config-save-button').click(),
  ])

  await page.reload()

  await expect(page.locator('#config-base-url')).toHaveValue(config.baseUrl)
  await expect(page.locator('#config-model')).toHaveValue(config.model)
  await expect(page.locator('#config-timeout')).toHaveValue(String(config.timeoutMs))
  await expect(page.locator('#config-api-key')).toHaveValue(config.apiKey)
})
