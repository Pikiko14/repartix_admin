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
    },
    deleteCourier(id) {
      const index = this.getIndex(id)
      this.couriers.splice(index, 1)
      this.totalItems--
    },
    getIndex(id) {
      return this.couriers.findIndex((el) => el._id === id)
    },
  },
})
