import { computed } from 'vue'
import { boot } from 'quasar/wrappers'
import { notification } from './notification'
import { useAuthStore } from 'src/stores/authStore'

const store = useAuthStore()

const userData = computed(() => store.getUser)
const roles = userData.value && userData.value._id ? userData.value.scopes : []

export default boot(async ({ router, app }) => {
  const i18n = app.config.globalProperties.$i18n

  router.beforeEach((to, from, next) => {
    if (
      (to.fullPath === '/login' && userData.value._id) ||
      (to.fullPath === '/' && userData.value._id)
    ) {
      next('/dashboard')
      return
    }

    if (to.matched.some((record) => record.meta.auth) && !userData.value._id) {
      notification(
        'negati',
        i18n.locale === 'es'
          ? 'Necesitas estar logueado para acceder a esta sección'
          : 'You need to be logged in to access this section',
        'warning',
      )
      store.doLogout()
      next('/')
      return
    }

    if (
      to.fullPath.includes('/dashboard') && !store.getHaveSubscription ||
      to.fullPath.includes('/dashboard') && userData.value.subscription && !userData.value.subscription.is_active
    ) {
      store.openModalPlan(true)
    }

    if (to.matched.some((record) => record.meta.available)) {
      const available = to.meta.available
      let hasPermission = false

      if (available.length > 0 && roles.length > 0) {
        for (const permission of roles) {
          if (available.includes(permission)) {
            hasPermission = true
            break
          }
        }
      }

      if (!hasPermission) {
        notification(
          'negati',
          i18n.locale === 'es'
            ? 'No tienes permiso para poder ver esta sección de la app'
            : 'You do not have permission to view this section of the app',
          'warning',
        )
        next(false)
        return
      }
    }

    next()
  })
})
