// imports
import { api } from 'src/boot/axios'
import { useUsersStore } from 'src/stores/usersStore'

export const usersContent = () => {
  // references
  const path = 'users'
  const store = useUsersStore();


  // methods
  const doCreateUser = async (payload) => {
    try {
      const params = JSON.parse(JSON.stringify(payload))
      delete params.confirmation_password
      const { data } = await api.post(`${path}`, params)
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doListUser = async (query) => {
    try {
      const { data } = await api.get(`${path}?${query}`)
      if (data.success) {
        store.setUsers(data.users?.data || [])
        store.setTotalItems(data.users?.totalItems || 0)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  // return
  return {
    doListUser,
    doCreateUser,
  }
}
