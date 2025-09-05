import { defineStore } from 'pinia'

export const useOrdersStore = defineStore('ordersStore', {
  state: () => ({
    orders: [],
    totalItems: 1,
    order: {},
  }),
  getters: {
    getOrder: (state) => state.order,
    getOrders: (state) => state.orders,
    getTotalItems: (state) => state.totalItems,
  },
  actions: {
    setOrders(payload) {
      this.orders = payload
    },
    upTotalItems() {
      this.totalItems++
    },
    setTotalItems(payload) {
      this.totalItems = payload
    },
    deleteOrder(id) {
      const index = this.getIndex(id)
      this.orders.splice(index, 1)
      this.totalItems--
    },
    getIndex(id) {
      return this.orders.findIndex((el) => el._id === id)
    },
    updateOrder(order) {
      delete order.__v
      const index = this.getIndex(order._id)
      this.orders[index] = order
    },
    setOrder(order) {
      this.order = order
    },
    putOrder(order) {
      this.order = order
    },
    addPayment(order) {
      this.order.payments = order.payments
    },
    clearOrders() {
      this.orders = []
      this.totalItems = 0
    },
    validateSocketData(payload) {
      if (payload.pdf) window.open(payload.pdf, '__blank');
    },
    clearOrder() {
      this.order = {}
    }
  },
})
