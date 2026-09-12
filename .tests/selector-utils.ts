import { type Page, type Locator } from '@playwright/test'

export interface ElementInfo {
  tag: string
  id: string
  classList: string[]
  dataAttrs: Record<string, string>
  aria: {
    label: string | null
    role: string | null
    describedBy: string | null
  }
  text: string
  path: string
  rect: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface MutationRecordInfo {
  type: 'childList' | 'attributes'
  targetTag: string
  targetPath: string
  addedHTML?: string
  removedHTML?: string
  attributeName?: string
  oldValue?: string
  newValue?: string
}

export interface UnstableCheckResult {
  unstable: boolean
  reason?: string
}

/**
 * 在指定 action 执行前后记录 DOM 变化。
 * 返回新增的节点以及属性变化信息，用于判断交互是否真的引起了 DOM 更新。
 */
export async function recordMutations(
  page: Page,
  action: () => Promise<void>,
  options: {
    timeout?: number
    rootSelector?: string
    attributeFilter?: string[]
  } = {},
): Promise<MutationRecordInfo[]> {
  const { timeout = 3000, rootSelector = 'body', attributeFilter = ['class', 'data-status', 'aria-label'] } = options

  await page.evaluate(
    ({ rootSelector, attributeFilter }) => {
      const root = document.querySelector(rootSelector) || document.body
      ;(window as any).__mutationRecords = []

      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          const getPath = (el: Element | null): string => {
            const path: string[] = []
            let cur: Element | null = el
            while (cur && cur.tagName !== 'BODY') {
              const id = cur.id ? `#${cur.id}` : ''
              const cls = cur.className && typeof cur.className === 'string' ? `.${cur.className.split(' ').join('.')}` : ''
              path.unshift(`${cur.tagName.toLowerCase()}${id}${cls}`)
              cur = cur.parentElement
            }
            return path.join(' > ')
          }

          if (mutation.type === 'childList') {
            for (const node of mutation.addedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                ;(window as any).__mutationRecords.push({
                  type: 'childList',
                  targetTag: (node as Element).tagName.toLowerCase(),
                  targetPath: getPath(node as Element),
                  addedHTML: (node as Element).outerHTML.slice(0, 800),
                })
              }
            }
            for (const node of mutation.removedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                ;(window as any).__mutationRecords.push({
                  type: 'childList',
                  targetTag: (node as Element).tagName.toLowerCase(),
                  targetPath: getPath(node as Element),
                  removedHTML: (node as Element).outerHTML.slice(0, 800),
                })
              }
            }
          } else if (mutation.type === 'attributes') {
            ;(window as any).__mutationRecords.push({
              type: 'attributes',
              targetTag: mutation.target.nodeName.toLowerCase(),
              targetPath: getPath(mutation.target as Element),
              attributeName: mutation.attributeName || undefined,
              oldValue: mutation.oldValue || undefined,
              newValue: (mutation.target as Element).getAttribute(mutation.attributeName || '') || undefined,
            })
          }
        }
      })

      observer.observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter,
        attributeOldValue: true,
      })
    },
    { rootSelector, attributeFilter },
  )

  await action()
  await page.waitForTimeout(timeout)

  return await page.evaluate(() => {
    const records = (window as any).__mutationRecords || []
    delete (window as any).__mutationRecords
    return records as MutationRecordInfo[]
  })
}

/**
 * 打印某个 locator 匹配到的元素完整信息，并在 headed 模式下依次高亮。
 * 用于快速判断 selector 是否选中了目标元素、是否唯一、是否稳定。
 */
export async function explainLocator(page: Page, selector: string): Promise<void> {
  const locator = page.locator(selector)
  const count = await locator.count()

  console.log(`\n🔍 selector: ${selector}`)
  console.log(`   count: ${count}`)

  if (count === 0) {
    console.log('   ⚠️ 未匹配到任何元素')
    return
  }

  const infos = (await locator.evaluateAll((elements) => {
    return elements.slice(0, 5).map((el) => {
      const attrs: Record<string, string> = {}
      for (const attr of el.attributes) {
        attrs[attr.name] = attr.value
      }

      const path: string[] = []
      let cur: Element | null = el
      while (cur && cur.tagName !== 'BODY') {
        const id = cur.id ? `#${cur.id}` : ''
        const cls = cur.className && typeof cur.className === 'string' ? `.${cur.className.split(' ').slice(0, 3).join('.')}` : ''
        path.unshift(`${cur.tagName.toLowerCase()}${id}${cls}`)
        cur = cur.parentElement
      }

      return {
        tag: el.tagName.toLowerCase(),
        id: el.id,
        classList: [...el.classList],
        dataAttrs: Object.fromEntries(Object.entries(attrs).filter(([k]) => k.startsWith('data-'))),
        aria: {
          label: el.getAttribute('aria-label'),
          role: el.getAttribute('role'),
          describedBy: el.getAttribute('aria-describedby'),
        },
        text: (el.textContent || '').trim().slice(0, 120),
        path: path.join(' > '),
        rect: {
          x: Math.round(el.getBoundingClientRect().x),
          y: Math.round(el.getBoundingClientRect().y),
          width: Math.round(el.getBoundingClientRect().width),
          height: Math.round(el.getBoundingClientRect().height),
        },
      }
    })
  })) as ElementInfo[]

  for (let i = 0; i < infos.length; i++) {
    const info = infos[i]
    console.log(`\n   [#${i}] ${info.tag}${info.id ? '#' + info.id : ''}`)
    console.log(`        class: ${info.classList.join(' ') || '(none)'}`)
    console.log(`        data-*: ${JSON.stringify(info.dataAttrs)}`)
    console.log(`        aria: ${JSON.stringify(info.aria)}`)
    console.log(`        text: ${info.text || '(empty)'}`)
    console.log(`        path: ${info.path}`)
    console.log(`        rect: ${info.rect.width}x${info.rect.height} @(${info.rect.x}, ${info.rect.y})`)
  }

  for (let i = 0; i < count; i++) {
    await locator.nth(i).highlight()
    await page.waitForTimeout(350)
  }
}

/**
 * 根据启发式规则判断一个 selector 是否“明显不稳定”。
 * 用于批量扫描 codegen 产物，快速标出需要人工 review 的部分。
 */
export function isLikelyUnstable(selector: string): UnstableCheckResult {
  // 包含日期
  if (/\d{4}[-/]\d{2}[-/]\d{2}/.test(selector)) {
    return { unstable: true, reason: '包含日期' }
  }

  // 包含 hash class（8 位以上十六进制）
  if (/[a-f0-9]{8,}/i.test(selector)) {
    return { unstable: true, reason: '可能包含 hash class' }
  }

  // 长文本定位，可能是用户生成内容
  if (/getByText\(['"][^'"]{20,}['"]\)/.test(selector)) {
    return { unstable: true, reason: '文本过长，可能是用户生成内容' }
  }

  // 使用了顺序、坐标或 nth-match
  if (/nth-match|nth-of-type|\(,*\d+,\d+\)|>> nth=|:nth\(/.test(selector)) {
    return { unstable: true, reason: '使用了顺序/坐标定位' }
  }

  // 完全没有使用稳定属性
  if (!/(getByRole|getByTestId|getByLabel|getByPlaceholder|#\w|data-testid|aria-label)/.test(selector)) {
    return { unstable: true, reason: '缺少稳定属性定位' }
  }

  return { unstable: false }
}

/**
 * 批量扫描一段录制代码中的所有 locator，并标出明显不稳定的那些。
 */
export function scanUnstableLocators(code: string): Array<{ locator: string } & UnstableCheckResult> {
  const locatorRegex = /page\.(locator|getByText|getByRole|getByTestId|getByLabel|getByPlaceholder)\([^)]+\)/g
  const matches = [...code.matchAll(locatorRegex)].map((m) => m[0])
  const seen = new Set<string>()
  const results: Array<{ locator: string } & UnstableCheckResult> = []

  for (const locator of matches) {
    if (seen.has(locator)) continue
    seen.add(locator)
    results.push({ locator, ...isLikelyUnstable(locator) })
  }

  return results
}

/**
 * 为一个 locator 生成若干更稳定的候选 selector，基于元素的 data-testid、aria、id、class 前缀。
 */
export async function generateCandidateSelectors(page: Page, selector: string): Promise<string[]> {
  const locator = page.locator(selector).first()
  const count = await locator.count()
  if (count === 0) return []

  return await locator.evaluate((el) => {
    const candidates = new Set<string>()

    if (el.getAttribute('data-testid')) {
      candidates.add(`[data-testid="${el.getAttribute('data-testid')}"]`)
      candidates.add(`getByTestId('${el.getAttribute('data-testid')}')`)
    }

    if (el.id) {
      candidates.add(`#${el.id}`)
    }

    if (el.getAttribute('role') && el.getAttribute('aria-label')) {
      candidates.add(`getByRole('${el.getAttribute('role')}', { name: '${el.getAttribute('aria-label')}' })`)
    }

    if (el.getAttribute('aria-label')) {
      candidates.add(`[aria-label="${el.getAttribute('aria-label')}"]`)
      candidates.add(`getByLabel('${el.getAttribute('aria-label')}')`)
    }

    if (el.getAttribute('placeholder')) {
      candidates.add(`getByPlaceholder('${el.getAttribute('placeholder')}')`)
    }

    // 过滤掉 hash class，保留可能稳定的短 class
    const stableClasses = [...el.classList].filter((c) => c.length < 20 && !/[a-f0-9]{6,}/i.test(c))
    if (stableClasses.length) {
      candidates.add(`.${stableClasses.join('.')}`)
    }

    // data-* 属性
    for (const attr of el.attributes) {
      if (attr.name.startsWith('data-') && attr.name !== 'data-testid') {
        candidates.add(`[${attr.name}="${attr.value}"]`)
      }
    }

    return [...candidates]
  })
}
