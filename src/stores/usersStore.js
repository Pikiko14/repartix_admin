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
      const index = this.getIndex(user._id)
      this.users[index] = user
    },
    deleteUser(id) {
      const index = this.getIndex(id)
      this.users.splice(index, 1)
      this.totalItems--
    },
    getIndex(id) {
      return this.users.findIndex((el) => el._id === id)
    },
    upTotalItems() {
      this.totalItems++
    }
  },
})
