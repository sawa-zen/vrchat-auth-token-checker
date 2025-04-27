#!/usr/bin/env node
import readline from 'readline'
import { AuthenticationApi, Configuration, type CurrentUser as BaseCurrentUser } from 'vrchat'
import axios from 'axios'

interface CurrentUser extends BaseCurrentUser {
  requiresTwoFactorAuth?: string[]
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const login = () => {
  return new Promise<{ username: string; password: string }>((resolve) => {
    rl.question('VRChat Username: ', (username) => {
      rl.question('VRChat Password: ', (password) => {
        resolve({ username, password })
      })
    })
  })
}

const twoFA = (type: 'emailOtp' | 'totp') => {
  const message = type === 'emailOtp' ? 'Email OTP Code: ' : 'TOTP Code: '
  return new Promise<{ code: string }>((resolve) => {
    rl.question(message, (code) => {
      resolve({ code })
    })
  })
}

const getAuthTokenByCookie = (cookie: string) => {
  const regExp = /auth=([^;]+)/
  const authToken = regExp.exec(cookie)?.[1]
  return authToken || ''
}

const main = async () => {
  try {
    const { username, password } = await login()

    const vrchatConfiguration = new Configuration({ username, password })
    const axiosInstance = axios.create({
      headers: { 'User-Agent': `vrc-auth-token-checker/0.1.4 ${username}` },
    })

    const api = new AuthenticationApi(vrchatConfiguration, undefined, axiosInstance)
    const getCurrentUserResponse = await api.getCurrentUser()
    let authToken = getAuthTokenByCookie(getCurrentUserResponse.config.headers?.['Cookie'] as string || '')

    const currentUserData = getCurrentUserResponse.data as CurrentUser
    const twoFAType = currentUserData['requiresTwoFactorAuth']?.[0]

    if (twoFAType === 'emailOtp') {
      const { code } = await twoFA('emailOtp')
      const r = await api.verify2FAEmailCode({ code })
      authToken = getAuthTokenByCookie(r.config.headers?.['Cookie'] as string || '')
    }

    if (twoFAType === 'totp') {
      const { code } = await twoFA('totp')
      const r = await api.verify2FA({ code })
      authToken = getAuthTokenByCookie(r.config.headers?.['Cookie'] as string || '')
    }

    console.log('Auth token:', authToken)
    await cleanup()
  } catch (error) {
    console.error('Error:', error)
    await cleanup()
  }
}

// Cleanup process
const cleanup = async () => {
  rl.close()
  if (process.stdin.isTTY) process.stdin.setRawMode(false)
  process.exit(0)
}

// Handle process termination
process.on('SIGINT', async() => { await cleanup() })
process.on('SIGTERM', async() => { await cleanup() })

// Start the application
main()
