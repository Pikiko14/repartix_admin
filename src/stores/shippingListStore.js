import { defineStore } from 'pinia'

export const useShippingListStore = defineStore('shippingList', {
  state: () => ({
    shipping: {},
    shippings: [],
    totalItems: 1,
  }),
  getters: {
    getShipping: (state) => state.shipping,
    getShippings: (state) => state.shippings,
    getTotalItems: (state) => state.totalItems,
  },
  actions: {
    setShippings(payload) {
      this.shippings = payload
    },
    upTotalItems() {
      this.totalItems++
    },
    setTotalItems(payload) {
      this.totalItems = payload
    },
    deleteShipping(id) {
      const index = this.getIndex(id)
      this.shippings.splice(index, 1)
      this.totalItems--
    },
    getIndex(id) {
      return this.shippings.findIndex((el) => el._id === id)
    },
    setShipping(payload) {
      this.shipping = payload
    },
  },
})
