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
          store.setUsers([...store.getCouriers, data.user])
        }
        store.upTotalItems();
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  // return
  return {
    doCreateCourier,
  }
}
