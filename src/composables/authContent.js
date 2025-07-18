// imports
import { api } from 'src/boot/axios'
import { useAuthStore } from 'src/stores/authStore'

export const authContent = () => {
  // references
  const path = 'auth'
  const userPath = 'users'
  const store = useAuthStore()

  // methods
  const doLogin = async (payload) => {
    try {
      const { data } = await api.post(`${path}/sign-in`, payload)
      if (data) {
        store.setUser(data?.user)
        store.setToken(data?.token)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doSignUp = async (payload) => {
    try {
      delete payload.confirmation_password
      const { data } = await api.post(`${path}/sign-up`, payload)
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doRecoveryPassword = async (payload) => {
    try {
      delete payload.confirmation_password
      const { data } = await api.post(`${path}/recovery-password`, payload)
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doChangePassword = async (payload) => {
    try {
      const { data } = await api.put(`${path}/change-password`, payload)
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doUpdateCredentials = async (payload) => {
    try {
      const { data } = await api.put(`${userPath}/update-credentials`, payload)
      if (data && data.success) {
        const { subscription } = store.getUser
        data.user.subscription = subscription
        store.setUser(data?.user)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doUpdateProfile = async (payload) => {
    try {
      const { data } = await api.put(`${userPath}/update-profile`, payload)
      if (data && data.success) {
        const { subscription } = store.getUser
        data.user.subscription = subscription
        store.setUser(data?.user)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doUpdateBrand = async (payload) => {
    try {
      const { data } = await api.put(`${userPath}/update-brand`, payload)
      if (data && data.success) {
        const { subscription } = store.getUser
        data.user.subscription = subscription
        store.setUser(data?.user)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  const doUpdateBrandConfiguration = async (payload) => {
    try {
      const { data } = await api.put(`${userPath}/update-brand-configuration`, payload)
      if (data && data.success) {
        const { subscription } = store.getUser
        data.user.subscription = subscription
        store.setUser(data?.user)
      }
      return data
    } catch (error) {
      console.error(error)
    }
  }

  // return
  return {
    doLogin,
    doSignUp,
    doUpdateBrand,
    doUpdateProfile,
    doChangePassword,
    doRecoveryPassword,
    doUpdateCredentials,
    doUpdateBrandConfiguration,
  }
}
