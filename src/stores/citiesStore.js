import { defineStore } from 'pinia'

export const useCitiesStore = defineStore('citiesStore', {
  state: () => ({
    cities: [],
    totalItems: 1,
  }),
  getters: {
    getCities: (state) => state.cities,
    getTotalItems: (state) => state.totalItems,
  },
  actions: {
    setCities(payload) {
      this.cities = payload
    },
    upTotalItems() {
      this.totalItems++
    },
    setTotalItems(payload) {
      this.totalItems = payload
    },
    deleteCity(id) {
      const index = this.getIndex(id)
      this.cities.splice(index, 1)
      this.totalItems--
    },
    getIndex(id) {
      return this.cities.findIndex((el) => el._id === id)
    },
    updateCity(courier) {
      delete courier.__v
      const index = this.getIndex(courier._id)
      this.cities[index] = courier
    },
  },
})
