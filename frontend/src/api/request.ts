import axios from 'axios'
import { ElMessage } from 'element-plus'

function readStoredToken(): string | null {
  try {
    const value = localStorage.getItem('token')?.trim() || ''
    if (!value || value === 'null' || value === 'undefined' || value === '[object Object]') {
      localStorage.removeItem('token')
      return null
    }
    return value
  } catch {
    return null
  }
}

function persistToken(token: string | null) {
  try {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  } catch {
    // Authentication still works for the current tab when storage is unavailable.
  }
}

// 模块级 token 缓存，避免每次请求都读 localStorage
let cachedToken: string | null = readStoredToken()

export function setToken(token: string | null) {
  const normalized = typeof token === 'string' ? token.trim() : ''
  cachedToken = normalized || null
  persistToken(cachedToken)
}

export function getToken(): string | null {
  return cachedToken
}

const request = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

function errorDetail(detail: unknown): string {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map(item => typeof item?.msg === 'string' ? item.msg : '').filter(Boolean).join('；') || '请求参数不符合要求'
  }
  return '请求失败'
}

// 请求拦截器：自动附加 token
request.interceptors.request.use(
  (config) => {
    if (cachedToken) {
      config.headers.Authorization = `Bearer ${cachedToken}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器：统一错误处理
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        setToken(null)
        // 不在登录页才跳转，避免死循环
        if (window.location.pathname !== '/login') {
          const next = `${window.location.pathname}${window.location.search}${window.location.hash}`
          window.location.href = `/login?next=${encodeURIComponent(next)}`
        }
      }
      ElMessage.error(errorDetail(data?.detail))
    } else {
      ElMessage.error('网络连接失败，请检查后端服务')
    }
    return Promise.reject(error)
  },
)

export default request
