import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'

const isDev = process.env.NODE_ENV == 'development'

export default defineManifest({
  name: packageData.name + (isDev ? '_dev' : ''),
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  key: 'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDGB8MEInfRXfl6mRu5aVJ6m+4oVr/vl12VX5Gq2MK1WeljfNrzM2nay1XXbwRjj0bN777bzXJoFxLxPR75mhZKRxMHK7zdHL7XHNQp7COXfSv1+DM/OK2RtJTeMMDy23L09Kt/2xI3Ko9KnPIFVB7ykQqge+X+yXhVpVLUSxo2NqgIQQ/Rasnc5rWOPjRABmZ/E2qba7raIjw6ELb0WVkUxeLN+85j8PK0Y9zgfmnUI+vIIZibOkRrfYcC85nqJ+VCJf9NeC+i9aRkpoH2yQbCGcMR+JATNj+SHhkMiCgZoFAiPmGglH6IhJZxxhTOm7gcPz9dKD38oJaxuwx0vk/5AgMBAAECggEACEYoP4q6I2EQDK+LgUB1jgJoXb6cJ+RU6GoVEcSbRA0E6596nXk7NcVTqZvtnMROgsm+2Xu4yUEXjUVOv0KRJlrYYG8TJdDu51mAwtynMwvrk4wihgR1+hXHt43lbfA92h7D8KRkWzI3yPgMQ607Wsq1HTX4CuB7muZ8srqNlpC4pBZgiMkzDM7ADj77hjUmyV3E3FTtGtCi9UbX1A0TckETIpdGU+6um58n+HYZmC5gA8ElmK+RgFpUNJ6YDRfDPPN/84MTcw4Txt3/aU+iqz/Q0a2YUizJ5Ng4zteTgvxChmlpgw3Wm/sRTfAw1s5NhK42mfoI1qu9xRkThpCixQKBgQD5dSM1H6vkT5cWFsCYo2ZCKFuU6zaPVXdlas0Mi9Tfu/B7u39ED5zTpMC5aPhc2sKxxIDnq8AhSPkriqNl2GfXlEF0st/8bTBocSXQNmmQSRbsMat0se5OA7MHh4vpz0r4HrBuvuXdu8ezPGC2QqTAx5iKCB+HA6bdxFj5ZrWaVQKBgQDLOVc++Ir0apMcxH/xdwanmPlloXTF0y07jbkIcjPitAIT95fS4cdSMf5gY2SrXgZn4ejJQjNe8+GVyhbguoSKDFevFl+MaTYFzVU99Ui5HmWhAMAZpghvDf+WRRJ2AT7JzIqRHf9XfzHFRIq3VutF3TgPOpBFCQxhFbEb5lsLFQKBgANUoAq2iIn80gyWcy3WiKf7d/WOCmVxg62T9nbjaw0tqjFMuI9FEhf1TCltkFtVBGJxODNfpKoNGl6NdE8Iy6IiNZmERd9N6eaLFDEqeNBXWXn/08U0FvVtsTc5hRGzFdIoPrzLya/jMPBgrv3f9+knAQ9eumUIFHNDitiRmX0dAoGBAKDE/hZc/WCap0MM2MKnjOYtiK8z6XNOuuvwFD9wSUfBbBtrtfooj0yhLEIIn21KdvrbpxMAgi9N9FpRg4PJSm0DkqJ6qqAj4473f8YCM8PvHisestoXlXh1tIqmnhIorglq/PwMpSINB8ytiqe75Whht6WkiNl0bQyo4nHV7JR5AoGAdNE4IjBbmgwPq6Av6m7uKrT87uUaIMivzH6UNUIDESVPPIi38ISFsuUjZB/Gy9ebWYHkQGq1OYmr7+9k2/StmW/S9yoacw9HfrraG7YzGJ9dGc++VtLidZqmtqfl6X5XJBxewmLd1i1aTmAtK0yJ/xYJ2JXBeIXyUg8re7MzBZ4=',
  host_permissions: [
    'https://chat.deepseek.com/*',
    'https://yuanbao.tencent.com/*',
    'http://127.0.0.1:8428/*',
    'http://127.0.0.1:9428/*',
  ],
  action: {
    default_popup: 'popup.html',
    default_icon: 'public/icons/icon.png',
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['https://chat.deepseek.com/*', 'https://yuanbao.tencent.com/*'],
      js: ['src/contentScript/index.ts'],
      run_at: 'document_start',
    },
  ],
  web_accessible_resources: [
    { resources: ['injected.js'], matches: ['https://chat.deepseek.com/*', 'https://yuanbao.tencent.com/*'] },
  ],
  permissions: ['unlimitedStorage', 'notifications'],
  storage: {
    managed_schema: 'storage/schema.json',
  },
})
