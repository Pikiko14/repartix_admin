import { defineStore } from 'pinia'

export const useSendersStore = defineStore('sendersStore', {
  state: () => ({
    senders: [],
    totalItems: 1,
  }),
  getters: {
    getSenders: (state) => state.senders,
    getTotalItems: (state) => state.totalItems,
  },
  actions: {
    setSenders(payload) {
      this.senders = payload
    },
    upTotalItems() {
      this.totalItems++
    },
    setTotalItems(payload) {
      this.totalItems = payload
    },
    deleteSender(id) {
      const index = this.getIndex(id)
      this.senders.splice(index, 1)
      this.totalItems--
    },
    getIndex(id) {
      return this.senders.findIndex((el) => el._id === id)
    },
    updateSender(client) {
      delete client.__v
      const index = this.getIndex(client._id)
      this.senders[index] = client
    },
  },
})
