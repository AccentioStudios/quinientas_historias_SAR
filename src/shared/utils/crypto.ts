import { randomBytes, createCipheriv, createDecipheriv } from 'crypto'
import * as argon2 from 'argon2'
import { v4 as uuidv4 } from 'uuid'

export const key = randomBytes(32)
export const iv = randomBytes(16)

export function generateUUID() {
  return uuidv4()
}

export function generateRandomHash(length?: number) {
  let lenghtToUse = length || 32
  return hashAESData(generateRandomString(lenghtToUse))
}

export function generateRandomString(length: number) {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
}

export function hashAESData(data: string) {
  let cipher = createCipheriv('aes-256-cbc', Buffer.from(key), iv)
  let encrypted = cipher.update(data)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return jsonToBase64(
    JSON.stringify({
      iv: iv.toString('hex'),
      encryptedData: encrypted.toString('hex'),
    })
  )
}

export function decryptAESData(hash: any) {
  let data = JSON.parse(base64ToJson(hash))
  let iv = Buffer.from(data.iv, 'hex')
  let encryptedText = Buffer.from(data.encryptedData, 'hex')
  let decipher = createDecipheriv('aes-256-cbc', Buffer.from(key), iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}

function jsonToBase64(object) {
  const json = JSON.stringify(object)
  return Buffer.from(json).toString('base64')
}

function base64ToJson(base64String: string) {
  const json = Buffer.from(base64String, 'base64').toString()
  return JSON.parse(json)
}

export function hashArgonData(data: string) {
  return argon2.hash(data)
}

export function verifyHashArgonData(hash: string, plain: string) {
  return argon2.verify(hash, plain)
}
