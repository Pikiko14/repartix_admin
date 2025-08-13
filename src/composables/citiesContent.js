// imports
import { api } from 'src/boot/axios'
import { useCitiesStore } from 'src/stores/citiesStore'

export const citiesContent = () => {
  // references
  const path = 'cities'
  const store = useCitiesStore()

  // methods
  const doCreateCities = async (payload) => {
    try {
      const params = JSON.parse(JSON.stringify(payload))
      delete params.confirmation_password
      const { data } = await api.post(`${path}`, params)
      if (data && data.data) {
        if (store.getCities.length < 10) {
          store.setCities([...store.getCities, data.data])
        }
        store.upTotalItems()
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doListCities = async (query) => {
    try {
      const { data } = await api.get(`${path}?${query}`)
      if (data.success) {
        store.setCities(data.cities?.data || [])
        store.setTotalItems(data.cities?.totalItems || 0)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doDeleteCities = async (id) => {
    try {
      const { data } = await api.delete(`${path}/${id}`)
      if (data) {
        store.deleteCity(id)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doUpdateCities = async (payload) => {
    try {
      const params = JSON.parse(JSON.stringify(payload))
      delete params.confirmation_password
      const { data } = await api.put(`${path}/${payload._id}`, params)
      if (data && data.data) {
        store.updateCity(data.data)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }


  // return
  return {
    doListCities,
    doUpdateCities,
    doCreateCities,
    doDeleteCities,
  }
}
