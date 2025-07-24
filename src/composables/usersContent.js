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
      if (data && data.user) {
        if (store.getUsers.length < 10) {
          store.setUsers([...store.getUsers, data.user])
        }
        store.upTotalItems();
      }
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

  const doUpdateUser = async (payload) => {
    try {
      const params = JSON.parse(JSON.stringify(payload))
      delete params.confirmation_password
      const { data } = await api.put(`${path}/${payload._id}`, params)
      if (data && data.data) {
        store.updateUser(data.data)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doDeleteUser = async (id) => {
    try {
      const { data } = await api.delete(`${path}/${id}`)
      if (data) {
        store.deleteUser(id)
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
    doUpdateUser,
    doDeleteUser,
  }
}
