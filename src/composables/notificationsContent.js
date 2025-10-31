// imports
import { api } from 'src/boot/axios'
import { useAuthStore } from 'src/stores/authStore'
//import { Utils } from 'src/utils/utils'

export const notificationsContent = () => {
    // references
    const path = 'notifications'
    const authStore = useAuthStore()
        //const utils = new Utils()

    // methods
    const loadNotifications = async(params = {}) => {
        try {
            const { data } = await api.get(`/${path}`, { params })
            return data
        } catch (error) {
            console.error('Error loading notifications:', error)
            throw error
        }
    }

    const loadUnreadCount = async() => {
        try {
            const { data } = await api.get(`/${path}/unread-count`)
            return data
        } catch (error) {
            console.error('Error loading unread count:', error)
            throw error
        }
    }

    const markAsRead = async(notificationId) => {
        try {
            const { data } = await api.post(`/${path}/mark-as-read`, {
                notification_id: notificationId
            })
            return data
        } catch (error) {
            console.error('Error marking as read:', error)
            throw error
        }
    }

    const markAllAsRead = async() => {
        try {
            const { data } = await api.post(`/${path}/mark-all-as-read`)
            return data
        } catch (error) {
            console.error('Error marking all as read:', error)
            throw error
        }
    }

    const deleteNotification = async(notificationId) => {
        try {
            const { data } = await api.delete(`/${path}/${notificationId}`)
            return data
        } catch (error) {
            console.error('Error deleting notification:', error)
            throw error
        }
    }

    // Función para validar permisos de notificación
    const hasPermissionForNotification = (notification) => {
        console.log(notification);
        //const user = authStore.getUser
        //if (!user ? .scopes || !Array.isArray(user.scopes)) {
        //    return false
        //}
        //// Validar según el tipo de notificación
        //switch (notification.type) {
        //    case 'order_status_updated':
        //        return utils.validateRole('list-order')
        //    case 'order_news_created':
        //        return utils.validateRole('list-order')
        //    case 'order_payment_created':
        //        return utils.validateRole('list-order')
        //    default:
        //        // Para otros tipos de notificación, verificar permisos básicos
        //        return utils.validateRole('list-order') || utils.validateRole('list-user')
        //}
    }

    // Función para obtener el room del socket basado en el usuario
    const getSocketRoom = () => {
        const user = authStore.getUser
        if (!user._id) {
            return null
        }
        // Siempre usar la room general del administrador (parent_id-parent_id)
        // Esto asegura que todas las notificaciones lleguen al admin principal
        const adminId = user.parent_id || user._id
        return `${adminId}-${adminId}`
    }

    // Función para obtener todos los rooms que el admin debe escuchar
    const getAllSocketRooms = () => {
        const user = authStore.getUser
        if (!user._id) {
            return []
        }

        const rooms = []

        // Room principal del admin
        rooms.push(`${user._id}-${user.parent_id || user._id}`)

        // Si el admin tiene usuarios secundarios, también debe escuchar en sus rooms
        // Esto se puede expandir si tienes una lista de usuarios secundarios
        if (user.parent_id && user.parent_id !== user._id) {
            // Room del usuario padre (si el admin es secundario)
            rooms.push(`${user.parent_id}-${user.parent_id}`)
        }

        return rooms
    }

    // Función para validar que el usuario esté autenticado
    const isUserAuthenticated = () => {
        const user = authStore.getUser
        return user._id && user.scopes
    }

    return {
        loadNotifications,
        loadUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        hasPermissionForNotification,
        getSocketRoom,
        getAllSocketRooms,
        isUserAuthenticated
    }
}