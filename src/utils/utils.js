import { useAuthStore } from 'src/stores/authStore'

const store = useAuthStore()

export class Utils {
  validateRole = (role) => {
    const user = store.getUser
    return user.scopes.includes(role)
  }
}
