// imports
import { api } from 'src/boot/axios'
import { useSendersStore } from 'src/stores/sendersStore'

export const sendersContent = () => {
  // references
  const path = 'senders'
  const store = useSendersStore()

  // methods
  const doCreateSender = async (payload) => {
    try {
      const params = JSON.parse(JSON.stringify(payload))
      delete params.confirmation_password
      const { data } = await api.post(`${path}`, params)
      if (data && data.data) {
        if (store.getSenders.length < 10) {
          store.setSenders([...store.getSenders, data.data])
        }
        store.upTotalItems()
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doListSenders = async (query) => {
    try {
      const { data } = await api.get(`${path}?${query}`)
      if (data.success) {
        store.setSenders(data.senders?.data || [])
        store.setTotalItems(data.senders?.totalItems || 0)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doDeleteSender = async (id) => {
    try {
      const { data } = await api.delete(`${path}/${id}`)
      if (data) {
        store.deleteCity(id)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doUpdateSender = async (payload) => {
    try {
      const params = JSON.parse(JSON.stringify(payload))
      delete params.confirmation_password
      const { data } = await api.put(`${path}/${payload._id}`, params)
      if (data && data.data) {
        store.updateCity(data.data)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  // return
  return {
    doListSenders,
    doUpdateSender,
    doCreateSender,
    doDeleteSender,
  }
}
