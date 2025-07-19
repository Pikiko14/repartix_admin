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
    updateUser(user) {
      delete user.__v;
      const index = this.users.findIndex((el) => el._id === user._id)
      this.users[index] = user
    },
  },
})
