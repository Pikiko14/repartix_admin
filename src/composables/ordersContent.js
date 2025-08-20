// imports
import { api } from 'src/boot/axios'
import { useOrdersStore } from 'src/stores/ordersStore'

export const ordersContent = () => {
  // references
  const path = 'orders'
  const store = useOrdersStore()

  // methods
  const doCreateOrder = async (payload) => {
    try {
      const params = JSON.parse(JSON.stringify(payload))
      delete params.confirmation_password
      const { data } = await api.post(`${path}`, params)
      if (data && data.data) {
        if (store.getOrders.length < 10) {
          store.setOrders([...store.getOrders, data.data])
        }
        store.upTotalItems()
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doListOrders = async (query) => {
    try {
      const { data } = await api.get(`${path}?${query}`)
      if (data.success) {
        store.setOrders(data.orders?.data || [])
        store.setTotalItems(data.orders?.totalItems || 0)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doDeleteOrder = async (id) => {
    try {
      const { data } = await api.delete(`${path}/${id}`)
      if (data) {
        store.deleteOrder(id)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doUpdateOrder = async (payload) => {
    try {
      const params = JSON.parse(JSON.stringify(payload))
      delete params.confirmation_password
      const { data } = await api.put(`${path}/${payload._id}`, params)
      if (data && data.data) {
        store.updateOrder(data.data)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  // return
  return {
    doListOrders,
    doUpdateOrder,
    doCreateOrder,
    doDeleteOrder,
  }
}
