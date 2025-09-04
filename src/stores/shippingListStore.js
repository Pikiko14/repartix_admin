import { defineStore } from 'pinia'

export const useShippingListStore = defineStore('shippingList', {
  state: () => ({
    shipping: {},
    shippings: [],
    totalItems: 1,
    enableEdit: false,
  }),
  getters: {
    getShipping: (state) => state.shipping,
    getShippings: (state) => state.shippings,
    getTotalItems: (state) => state.totalItems,
    getEnableEdit: (state) => state.enableEdit,
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
    deleteOrderFromShipping(id) {
      const idx = this.shipping.orders.findIndex((el) => el.id === id)
      this.shipping.orders.splice(idx, 1)
      this.enableEdit = !this.enableEdit
    },
    updateShipping(payload) {
      this.shipping = payload
      this.enableEdit = !this.enableEdit
    },
    addOrderToShippingList(payload) {
      const index = this.shipping.orders.findIndex((el) => el.id === payload.id)
      if (index !== -1) return;

      this.shipping.orders.push(payload)
      this.enableEdit = !this.enableEdit
    },
  },
})
