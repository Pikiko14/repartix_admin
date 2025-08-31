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
          <img width="40px" src="/images/location.png" color="primary" />
          <q-tooltip class="bg-primary">
            <div class="order-resume">
              <p>Cliente:</p>
              <p>{{ order.client }}</p>
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
import { useI18n } from 'vue-i18n';
import { computed, onBeforeMount, ref } from 'vue';
import { useAuthStore } from 'src/stores/authStore';
import { notification } from 'src/boot/notification';
import { useDashboardStore } from 'src/stores/dashboardStore';
import { GoogleMap, CustomMarker } from 'vue3-google-map';


// references
const { t } = useI18n();
const store = useAuthStore();
const dashboardStore = useDashboardStore();

const center = ref({ lat: 0, lng: 0 });
const pinOptions = { background: '#212245' }
const markerOptions = ref({ position: center.value });

// computeds
const config = computed(() => {
  return store.getUser?.brand?.configuration || {};
});

const orders = computed(() => {
  return dashboardStore.orders.map(order => {
    console.log(order);
    return {
      client: `${order?.client?.name} ${order?.client?.last_name}`,
      order: order?.reference,
      status: order?.status,
      coords: order?.client?.coords,
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

const openInfo = (order) => {
  console.log(order);
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
</style>
