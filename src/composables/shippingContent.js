// imports
import { api } from 'src/boot/axios'

export const shippingContent = () => {
  // references
  const path = 'shipping'

  // methods
  const doQuoteShipping = async (payload) => {
    try {
      const params = JSON.parse(JSON.stringify(payload))
      const { data } = await api.post(`${path}/quote`, params)
      return data
    } catch (error) {
      console.error(error)
    }
  }

  // return
  return {
    doQuoteShipping,
  }
}
