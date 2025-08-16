// imports
import { api } from 'src/boot/axios'
import { useClientsStore } from 'src/stores/clientsStore'

export const clientsContent = () => {
  // references
  const path = 'clients'
  const store = useClientsStore()

  // methods
  const doCreateClients = async (payload) => {
    try {
      const params = JSON.parse(JSON.stringify(payload))
      delete params.confirmation_password
      const { data } = await api.post(`${path}`, params)
      if (data && data.data) {
        if (store.getClients.length < 10) {
          store.setClients([...store.getClients, data.data])
        }
        store.upTotalItems()
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doListClients = async (query) => {
    try {
      const { data } = await api.get(`${path}?${query}`)
      if (data.success) {
        store.setClients(data.clients?.data || [])
        store.setTotalItems(data.clients?.totalItems || 0)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doDeleteClients = async (id) => {
    try {
      const { data } = await api.delete(`${path}/${id}`)
      if (data) {
        store.deleteClient(id)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doUpdateClients = async (payload) => {
    try {
      const params = JSON.parse(JSON.stringify(payload))
      delete params.confirmation_password
      const { data } = await api.put(`${path}/${payload._id}`, params)
      if (data && data.data) {
        store.updateClient(data.data)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }


  // return
  return {
    doListClients,
    doUpdateClients,
    doCreateClients,
    doDeleteClients,
  }
}
