import { defineStore } from 'pinia'

export const useClientsStore = defineStore('clientsStore', {
  state: () => ({
    clients: [],
    totalItems: 1,
  }),
  getters: {
    getClients: (state) => state.clients,
    getTotalItems: (state) => state.totalItems,
  },
  actions: {
    setClients(payload) {
      this.clients = payload
    },
    upTotalItems() {
      this.totalItems++
    },
    setTotalItems(payload) {
      this.totalItems = payload
    },
    deleteClient(id) {
      const index = this.getIndex(id)
      this.clients.splice(index, 1)
      this.totalItems--
    },
    getIndex(id) {
      return this.clients.findIndex((el) => el._id === id)
    },
    updateClient(client) {
      delete client.__v
      const index = this.getIndex(client._id)
      this.clients[index] = client
    },
  },
})
