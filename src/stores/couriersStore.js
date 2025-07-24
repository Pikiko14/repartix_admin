import { defineStore } from 'pinia'

export const useCouriersStore = defineStore('couriersStore', {
  state: () => ({
    couriers: [],
    totalItems: 1,
  }),
  getters: {
    getCouriers: (state) => state.couriers,
  },
  actions: {
    setUsers(payload) {
      this.users = payload
    },
    upTotalItems() {
      this.totalItems++
    },
  },
})
