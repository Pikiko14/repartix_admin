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

  const doFilterShippingList = async (id) => {
    try {
      const { data } = await api.get(`${path}/${id}`)
      if (data) {
        store.setShipping(data.shippingList)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doDeleteOrder = async (id) => {
    store.deleteOrderFromShipping(id)
  }

  const setNewOrder = (order) => {
    store.addOrderToShippingList(order)
  }

  const doUpdateShippingList = async (payload) => {
    try {
      const params = JSON.parse(JSON.stringify(payload))
      delete params.__v
      delete params.pdf_path
      delete params.createdAt
      delete params.updatedAt
      const { data } = await api.put(`${path}/${payload._id}`, params)
      if (data && data.shippingList) {
        store.updateShipping(data.shippingList)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const loadShippingPdf = async (id) => {
    try {
      const { data } = await api.get(`${path}/${id}/print-pdf`)
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doCloseShipping = async () => {
    store.closeShipping()
    return await doUpdateShippingList(store.getShipping)
  }

  // return
  return {
    setNewOrder,
    doDeleteOrder,
    loadShippingPdf,
    doCloseShipping,
    doUpdateShippingList,
    doFilterShippingList,
    doDeleteShippingList,
    doCreateShippingList,
    doListShippingMethods,
  }
}
