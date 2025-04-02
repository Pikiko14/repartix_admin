// imports
import { ref } from 'vue'
import { api } from 'src/boot/axios'

export const usePlansContent = () => {
  // references
  const path = 'plans'
  const plans = ref([])
  const subscriptionPath = 'subscription';

  // methods
  const loadPlans = async () => {
    try {
      const { data } = await api.get(`${path}?page=1&per_page=3`)
      plans.value = data.data
    } catch (error) {
      console.error(error)
    }
  }

  const doSubscription = async (params) => {
    try {
      const { data } = await api.post(`${subscriptionPath}`, params)
      return data;
    } catch (error) {
      console.error(error)
    }
  }

  // return
  return {
    plans,
    loadPlans,
    doSubscription,
  }
}
