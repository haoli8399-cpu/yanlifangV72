import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserRole } from '@/types'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('')
  const userInfo = ref<User | null>(null)
  const role = ref<UserRole>('company')

  const isLoggedIn = computed(() => !!token.value)
  const isCompany = computed(() => role.value === 'company')
  const isPerformer = computed(() => role.value === 'performer')

  function setToken(t: string) {
    token.value = t
  }

  function setUser(user: User) {
    userInfo.value = user
    role.value = user.role
  }

  function setRole(r: UserRole) {
    role.value = r
  }

  function logout() {
    token.value = ''
    userInfo.value = null
  }

  return {
    token,
    userInfo,
    role,
    isLoggedIn,
    isCompany,
    isPerformer,
    setToken,
    setUser,
    setRole,
    logout,
  }
})
