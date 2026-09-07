import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '@/router'
import * as authApi from '@/api/auth'
import { setToken, getToken } from '@/api/request'
import type { UserInfo } from '@/api/auth'

const SESSION_STORAGE_KEY = 'career_review_session_id'
const SESSION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function readStoredSessionId(): string | null {
  try {
    const value = sessionStorage.getItem(SESSION_STORAGE_KEY)?.trim() || ''
    if (!SESSION_ID_PATTERN.test(value)) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY)
      return null
    }
    return value
  } catch {
    return null
  }
}

function persistSessionId(sessionId: string | null) {
  try {
    if (sessionId) sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId)
    else sessionStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // The active page can continue even when browser storage is unavailable.
  }
}

export const useUserStore = defineStore('user', () => {
  // ---- state ----
  const token = ref<string | null>(getToken())
  const userInfo = ref<UserInfo | null>(null)
  // The dialogue itself remains authoritative on the server.  This browser
  // pointer only lets the review page restore that server-side conversation
  // after a refresh instead of asking the learner to repeat a turn.
  const currentSessionId = ref<string | null>(readStoredSessionId())

  // ---- getters ----
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '')
  const hasAssessment = computed(() => !!userInfo.value?.latest_assessment_id)
  const currentAssessmentId = computed(() =>
    userInfo.value?.active_assessment_id || userInfo.value?.latest_assessment_id || '',
  )

  // ---- actions ----

  /** 登录 */
  async function login(username: string, password: string) {
    const res = await authApi.login({ username, password })
    token.value = res.access_token
    setToken(res.access_token)
    await fetchUserInfo()
  }

  /** 注册 */
  async function register(username: string, password: string) {
    await authApi.register({ username, password })
  }

  /** 退出登录 */
  function logout() {
    token.value = null
    userInfo.value = null
    currentSessionId.value = null
    persistSessionId(null)
    setToken(null)
    router.push('/login')
  }

  /** 获取当前用户信息 */
  async function fetchUserInfo() {
    const info = await authApi.getMe()
    userInfo.value = info
  }

  /** 选择一条已完成诊断，服务端持久化后同步所有结果页面。 */
  async function selectAssessment(assessmentId: string) {
    userInfo.value = await authApi.setActiveAssessment(assessmentId)
  }

  /** 修改密码 */
  async function changePassword(oldPwd: string, newPwd: string) {
    await authApi.changePassword({ old_password: oldPwd, new_password: newPwd })
  }

  /** 存储当前学习会话 ID */
  function setCurrentSession(sessionId: string | null) {
    const normalized = typeof sessionId === 'string' && SESSION_ID_PATTERN.test(sessionId.trim()) ? sessionId.trim() : null
    currentSessionId.value = normalized
    persistSessionId(normalized)
  }

  return {
    // state
    token,
    userInfo,
    currentSessionId,
    // getters
    isLoggedIn,
    username,
    hasAssessment,
    currentAssessmentId,
    // actions
    login,
    register,
    logout,
    fetchUserInfo,
    selectAssessment,
    changePassword,
    setCurrentSession,
  }
})
