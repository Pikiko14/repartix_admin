import { api } from 'src/boot/axios'
import { useRoutesStore } from 'src/stores/routesStore'
import { useShippingListStore } from 'src/stores/shippingListStore'

export const routesContent = () => {
  const path = 'route-optimization'
  const store = useRoutesStore()
  const shippingListStore = useShippingListStore()

  const doOptimizeRoute = async (payload) => {
    try {
      const { data } = await api.post(`${path}/optimize`, payload)
      return data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const doListRoutes = async (query) => {
    try {
      const { data } = await api.get(`${path}?${query}`)
      if (data.success) {
        store.setRoutes(data.data || [])
        store.setTotalItems(data.totalItems || 0)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doGetOptimizedRoute = async (shippingListId, routeType) => {
    try {
      const { data } = await api.get(`${path}/optimize`, {
        params: {
          shipping_list_id: shippingListId,
          route_type: routeType,
        }
      })
      if (data.success) {
        store.setRoute(data.data)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doGetShippingLists = async (query) => {
    try {
      const { data } = await api.get(`shipping-list?${query}`)
      if (data.success) {
        shippingListStore.setShippings(data.shippingList?.data || [])
        shippingListStore.setTotalItems(data.shippingList?.totalItems || 0)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doDeleteRoute = async (id) => {
    try {
      const { data } = await api.delete(`${path}/${id}`)
      return data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  return {
    doOptimizeRoute,
    doListRoutes,
    doGetOptimizedRoute,
    doGetShippingLists,
    doDeleteRoute,
  }
}

