import { defineStore } from 'pinia'

export const usePlanStore = defineStore('planStore', {
  state: () => ({
    plans: [],
  }),
  getters: {
    getPlans: (state) => state.plans,
  },
  actions: {
    setPlans(plans) {
      this.plans = plans
    },
  },
})
