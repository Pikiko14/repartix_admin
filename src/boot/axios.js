import axios from 'axios'
import { defineBoot } from '#q-app/wrappers'
import { notification } from './notification'
import { LocalStorage } from 'quasar'

const token = LocalStorage.getItem('token')

// prepare headers
let headers = {
  'Content-Type': 'application/json',
}
if (token) {
  headers['Authorization'] = `Bearer ${token}`
}
const api = axios.create({
  baseURL: `${process.env.API_URL}/api`,
  headers: headers,
})

export default defineBoot(() => {
  // prepare interceptor axios
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
