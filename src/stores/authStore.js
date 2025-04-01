import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'

export const useAuthStore = defineStore('authStore', {
  state: () => ({
    user: LocalStorage.getItem('user')
      ? JSON.parse(LocalStorage.getItem('user'))
      : {},
  }),
  getters: {
    getUser: (state) => state.user,
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
  },
})
