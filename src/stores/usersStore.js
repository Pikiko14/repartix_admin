import { defineStore } from 'pinia'

export const useUsersStore = defineStore('usersStore', {
  state: () => ({
    users: [],
    totalItems: 1,
  }),
  getters: {
    getUsers: (state) => state.users,
    getTotalItems: (state) => state.totalItems,
  },
  actions: {
    setUsers(payload) {
      this.users = payload
    },
    setTotalItems(payload) {
      this.totalItems = payload
    },
  },
})
