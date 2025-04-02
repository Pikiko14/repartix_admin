import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'

export const useAuthStore = defineStore('authStore', {
  state: () => ({
    user: LocalStorage.getItem('user') ? JSON.parse(LocalStorage.getItem('user')) : {},
    modalPlan: false,
  }),
  getters: {
    getUser: (state) => state.user,
    getHaveSubscription: (state) => state.user?.subscription,
    getOpenModalPlan: (state) => state.modalPlan,
  },
  actions: {
    setUser(userData) {
      this.user = userData
      if (userData) LocalStorage.setItem('user', JSON.stringify(userData))
    },
    doLogout() {
      this.user = {}
      LocalStorage.removeItem('user')
      LocalStorage.removeItem('token')
    },
    setToken(token) {
      LocalStorage.removeItem('token')
      LocalStorage.setItem('token', token)
    },
    openModalPlan(status) {
      this.modalPlan = status
    },
  },
})
