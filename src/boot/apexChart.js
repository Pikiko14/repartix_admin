import { defineBoot } from '#q-app/wrappers'
import VueApexCharts from 'vue3-apexcharts'

export default defineBoot(async ({ app }) => {
  app.use(VueApexCharts)
})
