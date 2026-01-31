/**
 * E2E Encryption Library using TweetNaCl
 * Simple, audited public-key encryption
 *
 * Flow:
 * 1. Each user generates a key pair (public stored in DB, private in IndexedDB)
 * 2. To send: Encrypt with recipient's public key + sender's private key
 * 3. To receive: Decrypt with sender's public key + recipient's private key
 */

import nacl from 'tweetnacl'
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util'

const DB_NAME = 'openpools_encryption'
const DB_VERSION = 2  // Bumped to clear old Web Crypto API keys
const STORE_NAME = 'keys'

// ============================================
// IndexedDB Operations for Private Key Storage
// ============================================

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      // Delete old store if upgrading (incompatible format)
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME)
      }
      db.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
  })
}

async function storeKeyPair(userId, publicKey, privateKey) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put({
      id: userId,
      publicKey: encodeBase64(publicKey),
      privateKey: encodeBase64(privateKey),
      createdAt: Date.now()
    })
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

async function getStoredKeys(userId) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(userId)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      if (!request.result) {
        resolve(null)
        return
      }
      resolve({
        publicKey: decodeBase64(request.result.publicKey),
        privateKey: decodeBase64(request.result.privateKey)
      })
    }
  })
}

async function deleteStoredKeys(userId) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(userId)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// ============================================
// Key Generation
// ============================================

/**
 * Generate a new key pair
 * @returns {{publicKey: Uint8Array, privateKey: Uint8Array}}
 */
export function generateKeyPair() {
  return nacl.box.keyPair()
}

// ============================================
// Encryption / Decryption
// ============================================

/**
 * Encrypt a message
 * @param {string} plaintext - Message to encrypt
 * @param {string} recipientPublicKeyBase64 - Recipient's public key
 * @param {string} senderPrivateKeyBase64 - Sender's private key
 * @param {string} senderPublicKeyBase64 - Sender's public key (included in payload for decryption)
 * @returns {string} - Encrypted payload as JSON string
 */
export function encryptMessage(plaintext, recipientPublicKeyBase64, senderPrivateKeyBase64, senderPublicKeyBase64) {
  const recipientPublicKey = decodeBase64(recipientPublicKeyBase64)
  const senderPrivateKey = decodeBase64(senderPrivateKeyBase64)

  // Generate random nonce
  const nonce = nacl.randomBytes(nacl.box.nonceLength)

  // Encrypt
  const messageBytes = decodeUTF8(plaintext)
  const encrypted = nacl.box(messageBytes, nonce, recipientPublicKey, senderPrivateKey)

  if (!encrypted) {
    throw new Error('Encryption failed')
  }

  // Package as JSON - include BOTH public keys so both sender and recipient can decrypt
  const payload = {
    v: 1,
    nonce: encodeBase64(nonce),
    ciphertext: encodeBase64(encrypted),
    senderPublicKey: senderPublicKeyBase64,
    recipientPublicKey: recipientPublicKeyBase64  // Needed for sender to decrypt their own messages
  }

  return JSON.stringify(payload)
}

/**
 * Decrypt a message
 * @param {string} encryptedPayload - Encrypted payload as JSON string
 * @param {string} myPrivateKeyBase64 - Current user's private key
 * @returns {string} - Decrypted plaintext
 */
export function decryptMessage(encryptedPayload, myPrivateKeyBase64) {
  const payload = JSON.parse(encryptedPayload)

  if (payload.v !== 1) {
    throw new Error(`Unsupported encryption version: ${payload.v}`)
  }

  const nonce = decodeBase64(payload.nonce)
  const ciphertext = decodeBase64(payload.ciphertext)
  const myPrivateKey = decodeBase64(myPrivateKeyBase64)

  // Try decrypting as recipient first (using sender's public key)
  const senderPublicKey = decodeBase64(payload.senderPublicKey)
  let decrypted = nacl.box.open(ciphertext, nonce, senderPublicKey, myPrivateKey)

  // If that fails and we have recipient's public key, try as sender
  if (!decrypted && payload.recipientPublicKey) {
    const recipientPublicKey = decodeBase64(payload.recipientPublicKey)
    decrypted = nacl.box.open(ciphertext, nonce, recipientPublicKey, myPrivateKey)
  }

  if (!decrypted) {
    // If no recipientPublicKey in payload, this is an old format message
    // that the sender can't decrypt
    if (!payload.recipientPublicKey) {
      throw new Error('OLD_FORMAT')
    }
    throw new Error('Decryption failed - invalid keys or corrupted message')
  }

  return encodeUTF8(decrypted)
}

// ============================================
// Key Management Functions
// ============================================

/**
 * Initialize encryption for a user
 * Returns existing keys or generates new ones
 * @param {string} userId
 * @returns {Promise<{publicKey: string, privateKey: string, isNew: boolean}>}
 */
export async function initializeEncryption(userId) {
  // Check for existing keys
  const existingKeys = await getStoredKeys(userId)

  if (existingKeys) {
    return {
      publicKey: encodeBase64(existingKeys.publicKey),
      privateKey: encodeBase64(existingKeys.privateKey),
      isNew: false
    }
  }

  // Generate new key pair
  const keyPair = generateKeyPair()

  // Store in IndexedDB
  await storeKeyPair(userId, keyPair.publicKey, keyPair.secretKey)

  return {
    publicKey: encodeBase64(keyPair.publicKey),
    privateKey: encodeBase64(keyPair.secretKey),
    isNew: true
  }
}

/**
 * Force regenerate keys (for key rotation or mismatch)
 * @param {string} userId
 * @returns {Promise<{publicKey: string, privateKey: string}>}
 */
export async function regenerateKeys(userId) {
  // Delete existing
  await deleteStoredKeys(userId)

  // Generate new
  const keyPair = generateKeyPair()

  // Store
  await storeKeyPair(userId, keyPair.publicKey, keyPair.secretKey)

  return {
    publicKey: encodeBase64(keyPair.publicKey),
    privateKey: encodeBase64(keyPair.secretKey)
  }
}

/**
 * Get stored private key
 * @param {string} userId
 * @returns {Promise<string|null>} Base64 encoded private key
 */
export async function getPrivateKey(userId) {
  const keys = await getStoredKeys(userId)
  return keys ? encodeBase64(keys.privateKey) : null
}

/**
 * Get stored public key
 * @param {string} userId
 * @returns {Promise<string|null>} Base64 encoded public key
 */
export async function getLocalPublicKey(userId) {
  const keys = await getStoredKeys(userId)
  return keys ? encodeBase64(keys.publicKey) : null
}

/**
 * Clear encryption keys
 * @param {string} userId
 */
export async function clearEncryptionKeys(userId) {
  await deleteStoredKeys(userId)
}

// ============================================
// Utility Functions
// ============================================

/**
 * Check if content is an encrypted message
 * @param {string} content
 * @returns {boolean|'legacy'}
 */
export function isEncryptedMessage(content) {
  try {
    const parsed = JSON.parse(content)
    // New TweetNaCl format (v1 with nonce = NaCl, v1 with iv = old Web Crypto)
    if (parsed.v === 1 && parsed.nonce && parsed.ciphertext && parsed.senderPublicKey) {
      return true
    }
    // Legacy Web Crypto API format - can't be decrypted with TweetNaCl
    if ((parsed.v === 1 || parsed.v === 2) && parsed.iv && parsed.data) {
      return 'legacy'
    }
    return false
  } catch {
    return false
  }
}

/**
 * Check if encryption is supported in this browser
 * @returns {boolean}
 */
export function isEncryptionSupported() {
  return typeof indexedDB !== 'undefined'
}

/**
 * Validate that a public key is the correct format (32 bytes for NaCl)
 * @param {string} publicKeyBase64
 * @returns {boolean}
 */
export function isValidPublicKey(publicKeyBase64) {
  try {
    const decoded = decodeBase64(publicKeyBase64)
    return decoded.length === 32 // NaCl box public keys are 32 bytes
  } catch {
    return false
  }
}

/**
 * Verify that local keys match the server public key
 * @param {string} userId
 * @param {string} serverPublicKey - Public key from database
 * @returns {Promise<boolean>}
 */
export async function verifyKeyMatch(userId, serverPublicKey) {
  const localPublicKey = await getLocalPublicKey(userId)
  return localPublicKey === serverPublicKey
}
