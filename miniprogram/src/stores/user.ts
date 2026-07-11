import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserRole, PerformerType } from '@/types'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('')
  const userInfo = ref<User | null>(null)
  const role = ref<UserRole>('company')
  const actorType = ref<PerformerType>('indie')

  const isLoggedIn = computed(() => !!token.value)
  const isCompany = computed(() => role.value === 'company')
  const isPerformer = computed(() => role.value === 'performer')
  // 仅独立艺人（艺人角色且非经纪公司）
  const isIndiePerformer = computed(
    () => role.value === 'performer' && actorType.value !== 'agency'
  )

  function setToken(t: string) {
    token.value = t
  }

  function setUser(user: User) {
    userInfo.value = user
    role.value = user.role
    if (user.role === 'performer' && 'actorType' in user) {
      actorType.value = (user as { actorType?: PerformerType }).actorType || 'indie'
    }
  }

  function setRole(r: UserRole, actor?: PerformerType) {
    role.value = r
    if (actor) actorType.value = actor
  }

  function logout() {
    token.value = ''
    userInfo.value = null
  }

  return {
    token,
    userInfo,
    role,
    actorType,
    isLoggedIn,
    isCompany,
    isPerformer,
    isIndiePerformer,
    setToken,
    setUser,
    setRole,
    logout,
  }
})
