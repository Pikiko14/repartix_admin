// imports
import { api } from 'src/boot/axios'

export const guidesContent = () => {
  // references
  const path = 'guides'

  // methods
  const doGetGuide = async (query) => {
    try {
      const { data } = await api.get(`${path}?${query}`)
      return data
    } catch (error) {
      console.error(error)
    }
  }

  // return
  return {
    doGetGuide,
  }
}
