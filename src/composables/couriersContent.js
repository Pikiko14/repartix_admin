// imports
import { api } from 'src/boot/axios'
import { useCouriersStore } from 'src/stores/couriersStore'

export const couriersContent = () => {
  // references
  const path = 'couriers'
  const store = useCouriersStore()

  // methods
  const doCreateCourier = async (payload) => {
    try {
      const params = JSON.parse(JSON.stringify(payload))
      delete params.confirmation_password
      const { data } = await api.post(`${path}`, params)
      if (data && data.user) {
        if (store.getCouriers.length < 10) {
          store.setCouriers([...store.getCouriers, data.user])
        }
        store.upTotalItems()
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doListCourier = async (query) => {
    try {
      const { data } = await api.get(`${path}?${query}`)
      if (data.success) {
        store.setCouriers(data.users?.data || [])
        store.setTotalItems(data.users?.totalItems || 0)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doDeleteCouriers = async (id) => {
    try {
      const { data } = await api.delete(`${path}/${id}`)
      if (data) {
        store.deleteCourier(id)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doUpdateCourier = async (payload) => {
    try {
      const params = JSON.parse(JSON.stringify(payload))
      delete params.confirmation_password
      const { data } = await api.put(`${path}/${payload._id}`, params)
      if (data && data.data) {
        store.updateCourier(data.data)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doListCourierForSelect = async () => {
    try {
      const { data } = await api.get(`${path}/for/select`)
      return data
    } catch (error) {
      console.error(error)
    }
  }

  // return
  return {
    doListCourier,
    doUpdateCourier,
    doCreateCourier,
    doDeleteCouriers,
    doListCourierForSelect,
  }
}
