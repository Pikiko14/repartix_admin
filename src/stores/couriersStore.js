import { defineStore } from 'pinia'

export const useCouriersStore = defineStore('couriersStore', {
  state: () => ({
    couriers: [],
    totalItems: 1,
  }),
  getters: {
    getCouriers: (state) => state.couriers,
    getTotalItems: (state) => state.totalItems,
  },
  actions: {
    setCouriers(payload) {
      this.couriers = payload
    },
    upTotalItems() {
      this.totalItems++
    },
    setTotalItems(payload) {
      this.totalItems = payload
    }
  },
})
