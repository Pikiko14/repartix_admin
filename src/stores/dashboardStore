import { defineStore } from 'pinia'

export const useDashboardStore = defineStore('dashboardStore', {
  state: () => ({
    counters: {},
    orders: [],
  }),
  getters: {
    getCounter: (state) => state.counters,
    getOrders: (state) => state.orders,
  },
  actions: {
    setCounter(counter) {
      this.counters = counter
    },
    setOrders(orders) {
      this.orders = orders
    },
  },
})
