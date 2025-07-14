import axios from 'axios'
import { defineBoot } from '#q-app/wrappers'
import { notification } from './notification'
import { LocalStorage } from 'quasar'

// prepare headers
let headers = {
  'Content-Type': 'application/json',
}
const api = axios.create({
  baseURL: `${process.env.API_URL}/api`,
  headers: headers,
})

export default defineBoot(({ router }) => {
  // prepare interceptor axios request
  api.interceptors.request.use((config) => {
    const token = LocalStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  }, (error) => {
    return Promise.reject(error)
  })

  // prepare interceptor axios response
  api.interceptors.response.use(undefined, async (error) => {
    if (error.response) {
      if (error.response.status === 422) {
        if (error) {
          const { data } = error.response.data
          const { msg } = data.shift()
          notification('negative', msg, 'red')
        }
      } else if (error.response.status === 400) {
        const { data } = error.response
        if (data.message && typeof data.message === 'object') {
          const msg = data.message.shift()
          notification('negative', msg, 'red')
        } else {
          const { data } = error.response
          if (data && data.message) {
            notification('negative', data.message, 'red')
          }
        }
      } else if (error.response.status === 401) {
        const { data } = error.response
        if (data && data.message) {
          notification('negative', data.message, 'red')
        }
        LocalStorage.clear();
        router.push('/');
      } else {
        const { data } = error.response
        if (data && data.message) {
          notification('negative', data.message, 'red')
        }
      }
    }
    // return promise
    return Promise.reject(error)
  })
})

export { api }
