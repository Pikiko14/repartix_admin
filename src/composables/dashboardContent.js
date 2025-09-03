// imports
import { api } from 'src/boot/axios'
import { useDashboardStore } from 'src/stores/dashboardStore.js'

// content

export const dashboardContent = () => {
  // references
  const path = 'orders'
  const store = useDashboardStore()

  // methods
  const doListDashboardData = async (query) => {
    try {
      const { data } = await api.get(`${path}/dashboard/data?${query}`)
      const { orders } = data.data
      delete data.data.orders
      store.setCounter(data.data)
      store.setOrders(orders)
      return data
    } catch (error) {
      console.error(error)
    }
  }

  // return
  return {
    doListDashboardData,
  }
}
