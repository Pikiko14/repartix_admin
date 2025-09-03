// imports
import { api } from 'src/boot/axios'

export const shippingListContent = () => {
  // references
  const path = 'shipping-list'

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

  // return
  return {
    doCreateShippingList,
  }
}
