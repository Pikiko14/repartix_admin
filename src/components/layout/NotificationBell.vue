<template>
  <q-btn flat round dense icon="notifications" @click="toggleMenu">
    <q-badge v-if="unreadCount > 0" color="red" floating>
      {{ unreadCount > 99 ? '99+' : unreadCount }}
    </q-badge>

    <q-menu class="rounded-borders" style="overflow-y: hidden;">
      <q-list style="min-width: 350px; max-width: 360px" class="rounded-borders">
        <!-- Header -->
        <q-item class="bg-primary text-white">
          <q-item-section>
            <q-item-label class="text-weight-bold text-h6">
              {{ t('notifications') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat dense round icon="done_all" color="white" @click="handleMarkAllAsRead" v-if="unreadCount > 0">
              <q-tooltip class="bg-primary">{{ t('markAllAsRead') }}</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>

        <q-separator />

        <!-- Filtros -->
        <q-item dense>
          <q-item-section>
            <q-btn-toggle 
              v-model="filter" 
              spread 
              no-caps 
              flat
              dense
              toggle-color="primary" 
              :options="[
                { label: t('allNotifications'), value: 'all' },
                { label: t('unreadNotifications'), value: 'unread' }
              ]" 
              @update:model-value="loadNotifications" 
            />
          </q-item-section>
        </q-item>

        <q-separator />

        <!-- Loading -->
        <q-item v-if="loading">
          <q-item-section class="text-center">
            <q-spinner color="primary" size="2em" />
          </q-item-section>
        </q-item>

        <!-- Notifications List with Scroll -->
        <q-scroll-area v-else style="height: 460px; width: 100%;">
          <q-item
            v-for="notification in notifications"
            :key="notification._id"
            clickable
            v-ripple
            :class="{ 'bg-blue-1': !notification.read }"
            @click="handleNotificationClick(notification)"
          >
            <q-item-section avatar>
              <q-avatar 
                :color="getPriorityColor(notification.priority)" 
                text-color="white"
                :icon="getNotificationIcon(notification.type)"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold">
                {{ notification.title }}
              </q-item-label>
              <q-item-label caption lines="2" class="q-mt-xs">
                {{ notification.message }}
              </q-item-label>
              <q-item-label caption class="q-mt-xs text-grey-7">
                <q-icon name="access_time" size="xs" />
                {{ formatRelativeTime(notification.createdAt) }}
              </q-item-label>
            </q-item-section>

            <q-item-section side top>
              <div class="column items-end">
                <q-btn
                  v-if="utils.validateRole('delete-order')"
                  flat
                  round
                  dense
                  icon="close"
                  size="sm"
                  @click.stop="handleDelete(notification._id)"
                >
                  <q-tooltip class="bg-primary">{{ t('delete') }}</q-tooltip>
                </q-btn>

                <!-- Botón de descarga para PDFs -->
                <q-btn
                  v-if="(notification.type === 'report_pdf_generated' || notification.type === 'invoice_pdf_generated') && notification.metadata?.pdf_url"
                  flat
                  round
                  dense
                  icon="download"
                  size="sm"
                  color="primary"
                  @click.stop="handleDownloadPdf(notification.metadata.pdf_url)"
                >
                  <q-tooltip class="bg-primary">{{ t('downloadPdf') || 'Descargar PDF' }}</q-tooltip>
                </q-btn>
                
                <q-icon 
                  v-if="!notification.read"
                  name="fiber_manual_record"
                  color="primary"
                  size="xs"
                  class="q-mt-sm"
                />
              </div>
            </q-item-section>
          </q-item>

          <!-- Empty State -->
          <q-item v-if="notifications.length === 0">
            <q-item-section class="text-center text-grey d-flex flex-center flex-col">
              <q-icon name="notifications_none" size="2em" class="q-mb-md" />
              <div>{{ t('noNotifications') }}</div>
            </q-item-section>
          </q-item>
        </q-scroll-area>

        <!-- Footer with pagination -->
        <q-separator v-if="notifications.length > 0" />
        <q-item v-if="totalPages > 1">
          <q-item-section>
            <div class="row items-center justify-between">
              <q-btn flat dense icon="chevron_left" :disable="currentPage === 1" @click="previousPage" />

              <span class="text-caption">
                {{ t('page') }} {{ currentPage }} {{ t('of') }} {{ totalPages }}
              </span>

              <q-btn flat dense icon="chevron_right" :disable="currentPage === totalPages" @click="nextPage" />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup>
import { ref, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { notificationsContent } from 'src/composables/notificationsContent';
import { notification } from 'src/boot/notification';
import { Utils } from 'src/utils/utils';

const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();
const utils = new Utils();

// Composable
const {
  loadNotifications: loadNotificationsAPI,
  loadUnreadCount: loadUnreadCountAPI,
  markAsRead: markAsReadAPI,
  markAllAsRead: markAllAsReadAPI,
  deleteNotification: deleteNotificationAPI,
  getSocketRoom,
  isUserAuthenticated
} = notificationsContent();

// State
const limit = 10;
const filter = ref('all');
const totalPages = ref(1);
const currentPage = ref(1);
const unreadCount = ref(0);
const loading = ref(false);
const showMenu = ref(false);
const notifications = ref([]);

// Obtener socket existente
const { appContext } = getCurrentInstance();
const socket = appContext.config.globalProperties.$socket;

// Methods
const setupSocketListeners = () => {
  if (!socket) {
    console.warn('Socket no disponible');
    return;
  }

  // Validar que el usuario esté autenticado
  if (!isUserAuthenticated()) {
    console.warn('Usuario no autenticado');
    return;
  }

  // Obtener el room del socket
  const room = getSocketRoom();
  if (!room) {
    console.warn('No se pudo obtener el room del socket');
    return;
  }

  // Unirse a la sala de notificaciones del usuario
  //socket.emit('joinRoom', room);

  // Escuchar notificaciones internas
  socket.on('notification', (notification) => {
    // Solo procesar notificaciones internas (tienen type y parent_id)
    if (!notification.type || !notification.parent_id) {
      return; // Ignorar notificaciones que no sean internas
    }

    console.log('🔔 Notificación interna recibida en NotificationBell:', {
      type: notification.type,
      title: notification.title,
      parent_id: notification.parent_id,
      room: notification.room
    });

    // Agregar a la lista si cumple con el filtro
    if (filter.value === 'all' || (filter.value === 'unread' && !notification.read)) {
      notifications.value.unshift(notification);
    }

    // Incrementar contador solo si no está leída
    if (!notification.read) {
      unreadCount.value++;
    }

    // Mostrar toast
    // showNotificationToast(notification);

    // Reproducir sonido
    playNotificationSound();
  });
};

const loadNotifications = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      limit: limit,
      unread_only: filter.value === 'unread'
    };

    const data = await loadNotificationsAPI(params);
    notifications.value = data.notifications;
    totalPages.value = data.totalPages || 1;

  } catch (error) {
    console.error('Error loading notifications:', error);
    notification('negative', t('errorLoadingNotifications'), 'primary');
  } finally {
    loading.value = false;
  }
};

const loadUnreadCount = async () => {
  try {
    const data = await loadUnreadCountAPI();
    unreadCount.value = data.count;
  } catch (error) {
    console.error('Error loading unread count:', error);
  }
};

const handleNotificationClick = async (notification) => {
  if (!notification.read) {
    await markAsRead(notification._id);
  }

  showMenu.value = false;

  // Manejar notificaciones de PDF generado
  if ((notification.type === 'report_pdf_generated' || notification.type === 'invoice_pdf_generated') && notification.metadata?.pdf_url) {
    // Abrir PDF en nueva pestaña
    window.open(notification.metadata.pdf_url, '_blank');
    return;
  }

  // Navegar según el tipo de notificación
  if (notification.metadata?.order_id) {
    router.push({
      name: 'showOrder',
      params: { id: notification.metadata.order_id }
    });
  }
};

const markAsRead = async (notificationId) => {
  try {
    await markAsReadAPI(notificationId);

    // Actualizar localmente
    const notification = notifications.value.find(n => n._id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      notification.read_at = new Date();
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    }
  } catch (error) {
    console.error('Error marking as read:', error);
  }
};

const handleMarkAllAsRead = async () => {
  try {
    await markAllAsReadAPI();

    notifications.value.forEach(n => {
      n.read = true;
      n.read_at = new Date();
    });
    unreadCount.value = 0;

    notification('positive', t('allNotificationsMarkedAsRead'), 'primary');
  } catch (error) {
    console.error('Error marking all as read:', error);
    notification('negative', t('errorMarkingAllAsRead'), 'primary');
  }
};

const handleDownloadPdf = (pdfUrl) => {
  // Crear un elemento <a> temporal para descargar el PDF
  const link = document.createElement('a');
  link.href = pdfUrl;
  link.download = pdfUrl.split('/').pop() || 'report.pdf';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const handleDelete = async (notificationId) => {
  $q.dialog({
    title: t('confirmDelete'),
    message: t('deleteNotificationMessage'),
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await deleteNotificationAPI(notificationId);

      const index = notifications.value.findIndex(n => n._id === notificationId);
      if (index > -1) {
        const wasUnread = !notifications.value[index].read;
        notifications.value.splice(index, 1);
        if (wasUnread) {
          unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
      }

      notification('positive', t('notificationDeleted'), 'primary');
    } catch (error) {
      console.error('Error deleting notification:', error);
      notification('negative', t('errorDeletingNotification'), 'primary');
    }
  });
};

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
  if (showMenu.value) {
    loadNotifications();
  }
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    loadNotifications();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    loadNotifications();
  }
};

// Helpers
const getPriorityColor = (priority) => {
  const colors = {
    high: 'red',
    medium: 'orange',
    low: 'blue'
  };
  return colors[priority] || 'grey';
};

const getNotificationIcon = (type) => {
  const icons = {
    order_status_updated: 'sync',
    order_news_created: 'warning',
    order_payment_created: 'payments',
    report_pdf_generated: 'picture_as_pdf',
    invoice_pdf_generated: 'receipt'
  };
  return icons[type] || 'notifications';
};

const formatRelativeTime = (date) => {
  const now = new Date();
  const notifDate = new Date(date);
  const diffMs = now - notifDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins}m`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;

  return notifDate.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short'
  });
};

const playNotificationSound = () => {
  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play prevented:', e));
  } catch (error) {
    console.log('Error playing sound:', error);
  }
};

// Lifecycle
onMounted(() => {
  setupSocketListeners();
  loadUnreadCount();
});

onUnmounted(() => {
  // No necesitamos desconectar el socket global
  // Solo removemos los listeners específicos
  if (socket) {
    socket.off('notification');
  }
});
</script>

<style scoped lang="scss">
.q-item {
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
}

.bg-blue-1 {
  background-color: #e3f2fd;
}

// Estilos para el scroll personalizado
div[style*="overflow-y: auto"] {
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
    
    &:hover {
      background: #a8a8a8;
    }
  }
}

// Bordes redondeados para el menú
.rounded-borders {
  border-radius: 8px;
}

.rounded-top {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}
</style>
