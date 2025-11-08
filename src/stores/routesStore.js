import { defineStore } from 'pinia'

export const useRoutesStore = defineStore('routes', {
  state: () => ({
    routes: [],
    route: {},
    totalItems: 0,
  }),
  getters: {
    getRoutes: (state) => state.routes,
    getRoute: (state) => state.route,
    getTotalItems: (state) => state.totalItems,
  },
  actions: {
    setRoutes(payload) {
      this.routes = payload
    },
    setTotalItems(payload) {
      this.totalItems = payload
    },
    setRoute(payload) {
      this.route = payload
    },
    clearRoute() {
      this.route = {}
    },
    deleteRoute(id) {
      const index = this.routes.findIndex((el) => el._id === id)
      if (index !== -1) {
        this.routes.splice(index, 1)
        this.totalItems--
      }
    },
  },
})

