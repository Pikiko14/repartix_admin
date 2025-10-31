<template>
  <q-layout view="hHh LpR lFf">
    <!--Header-->
    <q-header v-if="route.path !== '/' && route.path !== '/register'">
      <q-toolbar class="bg-primary">
        <q-btn flat dense round color="white" icon="menu" aria-label="Menu" @click="toggleDrawer" />

        <q-toolbar-title class="text-white text-bold">
          RepartiX
        </q-toolbar-title>

        <!--lenguage-->
        <q-btn :label="locale === 'es' ? '🇪🇸' : '🇺🇸'" icon="language" flat dense rounded>
          <q-menu>
            <q-list style="min-width: 120px">
              <q-item clickable v-ripple @click="switchTo('es')">
                <q-item-section>
                  <q-item-label class="text-bold">
                    🇪🇸
                    Español
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple @click="switchTo('en')">
                <q-item-section class="text-bold">
                  🇺🇸 English</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <!--End lenguage-->

        <!--Notifications-->
        <NotificationBell />
        <!--End notifications-->

        <!--Perfil-->
        <q-btn @click="showProfileModal = !showProfileModal" icon="settings" flat dense rounded color="white">
          <q-tooltip class="bg-primary">
            {{ t('setting') }}
          </q-tooltip>
        </q-btn>
        <!--Perfil-->
      </q-toolbar>
    </q-header>
    <!--end Header-->

    <!--Drawer-->
    <q-drawer :mini="miniMode" :width="230" v-if="route.path !== '/' && route.path !== '/register'"
      v-model="leftDrawerOpen" show-if-above bordered>
      <AsideList />
    </q-drawer>
    <!--End drawer-->

    <!--Plan dialog-->
    <q-dialog v-model="showPlanModal" persistent @before-hide="closePlanModal">
      <PlansCard @close-modal="closePlanModal" />
    </q-dialog>
    <!--End plan dialog-->

    <!--Profile card-->
    <q-dialog v-model="showProfileModal">
      <ProfileCard />
    </q-dialog>
    <!--End profile card-->

    <!--Main content-->
    <q-page-container>
      <router-view :key="$route.fullPath" />
    </q-page-container>
    <!--End main content-->
  </q-layout>
</template>

<script setup>
// imports
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { LocalStorage, useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/authStore';
import { useOrdersStore } from 'src/stores/ordersStore';
import AsideList from 'src/components/layout/AsideList.vue';
import PlansCard from 'src/components/layout/PlansCard.vue';
import ProfileCard from 'src/components/layout/ProfileCard.vue';
import { useShippingListStore } from 'src/stores/shippingListStore';
import NotificationBell from 'src/components/layout/NotificationBell.vue';
import { computed, onBeforeMount, ref, watch, getCurrentInstance, onUnmounted, onBeforeUnmount } from 'vue';

// references
const q = useQuasar();
const route = useRoute();
const miniMode = ref(true);
const { t, locale } = useI18n();
const authStore = useAuthStore();
const showPlanModal = ref(false);
const leftDrawerOpen = ref(false);
const showProfileModal = ref(false);
const orderStore = useOrdersStore();
const { appContext } = getCurrentInstance();
const shippingStore = useShippingListStore();
const socket = appContext.config.globalProperties.$socket;

// computed
const user = computed(() => authStore.getUser);
const openModalPlan = computed(() => authStore.modalPlan);

// watch
watch(
  openModalPlan,
  (newVal) => {
    showPlanModal.value = newVal;
  }
);

// methods
function toggleDrawer() {
  if (q.screen.lt.md) {
    leftDrawerOpen.value = !leftDrawerOpen.value;
  } else {
    miniMode.value = !miniMode.value;
  }
}

const closePlanModal = () => {
  showPlanModal.value = false;
  authStore.openModalPlan(false);
}

const handleLeaveRoom = () => {
  if (user.value?._id) {
    socket.emit('leaveRoom', `${user.value?._id}`);
    socket.disconnect();
  }
}

const switchTo = (lang) => {
  locale.value = lang;
  LocalStorage.set('lang', lang);
  q.lang.set(lang);
  window.location.reload();
}

// hook
onBeforeMount(() => {
  // validate lang
  const lang = LocalStorage.getItem('lang') || 'es';
  locale.value = lang;

  // valdiate plans
  if (
    route.path.includes('/dashboard') && !user.value.subscription ||
    route.path.includes('/dashboard') && user.value.subscription && !user.value.subscription.is_active
  ) {
    showPlanModal.value = true;
  };

  // escuchamos las notificaciones
  socket.on('notification', (payload) => {
    // Notificaciones internas tienen campos: _id, type, title, message, parent_id, etc.
    // Notificaciones de actualización de datos tienen: success, data, model
    if (payload.success && payload.model) {
      // Es una notificación de actualización de datos (shipping_list, orders, etc.)
      const { data, model } = payload;

      switch (model) {
        case 'shipping_list':
          shippingStore.validateSocketData(data);
          break;

        case 'orders':
          orderStore.validateSocketData(data);
          break;

        default:
          break;
      }
    } else if (payload.type && payload.parent_id) {
      // Es una notificación interna (order_status_updated, order_news_created, etc.)
      // Esta notificación será procesada por NotificationBell.vue
      console.log('📨 Notificación interna recibida:', {
        type: payload.type,
        title: payload.title,
        parent_id: payload.parent_id
      });
    }
  });

  // join  user room
  // Para el admin principal, siempre usar su propio _id
  // Para usuarios secundarios, usar su parent_id (que es el ID del admin principal)
  const adminId = user.value.parent_id && user.value.parent_id !== user.value._id 
    ? user.value.parent_id 
    : user.value._id;
  
  setTimeout(() => {
    socket.emit('joinRoom', `${user.value._id}-${user.value.parent_id || user.value._id}`);
    socket.emit('joinRoom', `admin-${adminId}`);
    console.log(`🔔 Usuario ${user.value._id} unido a rooms:`, {
      personal: `${user.value._id}-${user.value.parent_id || user.value._id}`,
      admin: `admin-${adminId}`
    });
  }, 500);
  window.addEventListener('beforeunload', handleLeaveRoom);
});

onUnmounted(() => {
  socket.off('notification');
  window.removeEventListener('beforeunload', handleLeaveRoom);
});

onBeforeUnmount(() => {
  socket.emit('leaveRoom', `${user.value.id}`);
});
</script>
