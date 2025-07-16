import { useAuthStore } from 'src/stores/authStore'

const store = useAuthStore()

export class Utils {
  validateRole = (role) => {
    const user = store.getUser
    return user.scopes.includes(role)
  }

  validateUsability = (usability) => {
    const user = store.getUser
    if (!user.subscription) return false
    const { usabilities } = user.subscription
    return usabilities.find((el) => el.name === usability)
  }
}
