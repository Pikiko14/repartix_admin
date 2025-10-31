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

  const doGenerateReportPdf = async (payload) => {
    try {
      const { data } = await api.post(`${pathOrders}/report/generate-pdf`, payload)
      return data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const doGetPerformanceReport = async (query) => {
    try {
      const url = query ? `${pathOrders}/report/performance?${query}` : `${pathOrders}/report/performance`;
      const { data } = await api.get(url);
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('Error in doGetPerformanceReport:', error);
      throw error;
    }
  }

  // return
  return {
    doGetDiaryReport,
    doLiquidateReport,
    doGenerateReportPdf,
    doGetPerformanceReport,
  }
}
