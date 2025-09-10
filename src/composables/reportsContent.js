// imports
import { api } from 'src/boot/axios'

export const reportsContent = () => {
  // references
  const pathOrders = 'orders'

  // methods
  const doGetDiaryReport = async (query) => {
    try {
      const { data } = await api.get(`${pathOrders}/report/diary?${query}`)
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doLiquidateReport = async (query) => {
    try {
      const { data } = await api.get(`${pathOrders}/report/liquidation?${query}`)
      return data
    } catch (error) {
      console.error(error)
    }
  }

  // return
  return {
    doGetDiaryReport,
    doLiquidateReport,
  }
}
