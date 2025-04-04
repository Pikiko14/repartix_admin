// imports
import { api } from 'src/boot/axios'
import { useAuthStore } from 'src/stores/authStore'
import { usePlanStore } from 'src/stores/planStore'

export const usePlansContent = () => {
  // references
  const path = 'plans'
  const store = usePlanStore()
  const authStore = useAuthStore()
  const subscriptionPath = 'subscription'

  // methods
  const loadPlans = async () => {
    try {
      const { data } = await api.get(`${path}?page=1&per_page=3`)
      store.setPlans(data.data)
    } catch (error) {
      console.error(error)
    }
  }

  const doSubscription = async (params) => {
    try {
      const { data } = await api.post(`${subscriptionPath}`, params)
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const validateSubscription = async (userId) => {
    try {
      const { data } = await api.get(`${subscriptionPath}/${userId}`)
      if (data.success && data?.data?.subscription && data?.data?.subscription?.is_active) {
        const { subscription } = data.data
        authStore.setSubscription(subscription)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  // return
  return {
    loadPlans,
    doSubscription,
    validateSubscription,
  }
}
