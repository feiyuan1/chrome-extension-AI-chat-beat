import { AES_KEY_BYTES } from '../../constants/cypto-key'
import { EncryptedLabelModelConfig } from '../../types/cypto/modelConfig'
import { LabelModelConfig } from '../../types/modelConfig'

const IV_LENGTH = 12

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

async function importAesKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', AES_KEY_BYTES, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ])
}

export async function encryptConfig(config: LabelModelConfig): Promise<EncryptedLabelModelConfig> {
  const key = await importAesKey()
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const plaintext = new TextEncoder().encode(JSON.stringify(config))

  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext)

  return {
    xJ4: arrayBufferToBase64(iv.buffer),
    yK9: arrayBufferToBase64(ciphertext),
  }
}

export async function decryptConfig(stored: EncryptedLabelModelConfig): Promise<LabelModelConfig> {
  const key = await importAesKey()
  const iv = new Uint8Array(base64ToArrayBuffer(stored.xJ4))
  const ciphertext = base64ToArrayBuffer(stored.yK9)

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)

  const json = new TextDecoder().decode(decrypted)
  return JSON.parse(json) as LabelModelConfig
}
