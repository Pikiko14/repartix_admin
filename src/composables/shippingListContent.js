// imports
import { api } from 'src/boot/axios'
import { useShippingListStore } from 'src/stores/shippingListStore'

export const shippingListContent = () => {
  // references
  const path = 'shipping-list'
  const store = useShippingListStore()

  // methods
  const doCreateShippingList = async (payload) => {
    try {
      const params = JSON.parse(JSON.stringify(payload))
      const { data } = await api.post(`${path}`, params)
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doListShippingMethods = async (query) => {
    try {
      const { data } = await api.get(`${path}?${query}`)
      if (data.success) {
        store.setShippings(data.shippingList?.data || [])
        store.setTotalItems(data.shippingList?.totalItems || 0)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doDeleteShippingList = async (id) => {
    try {
      const { data } = await api.delete(`${path}/${id}`)
      if (data) {
        store.deleteShipping(id)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  // return
  return {
    doDeleteShippingList,
    doCreateShippingList,
    doListShippingMethods,
  }
}
