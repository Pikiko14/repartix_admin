<template>
  <section class="map-dashboard">
    <GoogleMap :api-key="config.gmap_api__key" mapId="map_dashboard_main"
      style="width: 100%; height: calc(100vh - 200px);" :center="center" :zoom="15">
      <!--you marker-->
      <CustomMarker v-if="center.lat > 0" :options="markerOptions">
        <div style="text-align: center">
          <img width="30px" src="/images/user-location.png" color="primary" />
          <q-tooltip class="bg-primary">
            {{ t('youPosition') }}
          </q-tooltip>
        </div>
      </CustomMarker>
      <!--End you marker-->

      <!--Orders marker-->
      <CustomMarker
        @click="openInfo(order)"
        v-for="(order, idx) in orders"
        :key="idx"
        :options="{ position: order.coords }"
        :pin-options="pinOptions"
      >
        <div style="text-align: center">
          <img v-if="order.status !== 'delivered'" width="40px" src="/images/location.png" />
          <img v-else width="40px" src="/images/location-success.png" />
          <q-tooltip class="bg-primary">
            <div class="order-resume">
              <p class="title">Cliente:</p>
              <p>{{ order.client }}</p>
              <p class="title">Orden:</p>
              <p>{{ order.order }}</p>
              <p class="title">Estado:</p>
              <p>{{ status[order.status] || order.status }}</p>
            </div>
          </q-tooltip>
        </div>
      </CustomMarker >
      <!--end orders marker-->
    </GoogleMap>
  </section>
</template>

<script setup>
// imports
import { Loading } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { computed, onBeforeMount, ref } from 'vue';
import { useAuthStore } from 'src/stores/authStore';
import { notification } from 'src/boot/notification';
import { GoogleMap, CustomMarker } from 'vue3-google-map';
import { useDashboardStore } from 'src/stores/dashboardStore.js';
import { ordersContent } from 'src/composables/ordersContent';


// references
const { t } = useI18n();
const router = useRouter();
const store = useAuthStore();
const orderContent = ordersContent();
const center = ref({ lat: 0, lng: 0 });
const dashboardStore = useDashboardStore();
const pinOptions = { background: '#212245' };
const markerOptions = ref({ position: center.value });

// computeds
const config = computed(() => {
  return store.getUser?.brand?.configuration || {};
});

const status = {
 pending: t('pending'),
 delivered: t('delivered'),
 cancelled: t('cancelled'),
 guide_news: t('guide_news'),
 in_progress: t('in_progress'),
 returned: t('returned'),
 'guide-printed': t('guide_printed'),
};

const orders = computed(() => {
  return dashboardStore.orders.map(order => {
    return {
      client: `${order?.client?.name} ${order?.client?.last_name}`,
      order: order?.reference,
      status: order?.status,
      coords: order?.client?.coords,
      id: order?._id,
    };
  });
});

// methods
const handlerGetCoords = async () => {
  if (!navigator.geolocation) {
    notification('negative', t('noNavigator'), 'red')
    return null
  }

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject)
    })

    const latitude = position.coords.latitude
    const longitude = position.coords.longitude

    return { latitude, longitude }
  } catch (error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        notification('negative', t('location.permissionDenied'), 'red')
        break
      case error.POSITION_UNAVAILABLE:
        notification('negative', t('location.unavailable'), 'red')
        break
      case error.TIMEOUT:
        notification('negative', t('location.timeout'), 'red')
        break
      default:
        notification('negative', t('location.unknownError'), 'red')
        break
    }
    return null
  }
}

const getCoords = async () => {
  const { latitude, longitude } = await handlerGetCoords();
  if (latitude && longitude) {
    center.value = {
      lat: +latitude,
      lng: +longitude,
    }
    markerOptions.value.position = center.value;
  }
};

const openInfo = async (order) => {
  Loading.show();
  try {
    const data = await orderContent.doShowOrder(order?.id);
    if (data?.success) {
      router.push({
        name: 'showOrder',
        params: {
          id: data?.order?._id,
        }
      });
    }
  } finally {
    Loading.hide();
  }
}

// hook
onBeforeMount(() => {
  getCoords();
});
</script>

<style scoped lang="scss">
.map-dashboard {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-window {
  max-width: 300px
}

.you {
  font-size: 1rem;
  font-weight: 600;
}

.order-resume {
  font-size: 1rem;

  .title {
    font-weight: 600;
  }
}
</style>
