<template>
  <section class="map-dashboard">
    <GoogleMap :api-key="config.gmap_api__key" mapId="map_dashboard_main"
      style="width: 100%; height: calc(100vh - 200px);" :center="center" :zoom="15">
      <Marker v-if="center.lat > 0" :options="markerOptions" />
    </GoogleMap>
    {{ config }}
  </section>
</template>

<script setup>
// imports
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { useAuthStore } from 'src/stores/authStore';
import { GoogleMap, Marker } from 'vue3-google-map';
import { notification } from 'src/boot/notification';

// references
const { t } = useI18n();
const store = useAuthStore();
const center = ref({ lat: 0, lng: 0 });
const markerOptions = ref({ position: center.value, label: 'L', title: 'LADY LIBERTY' });

// computeds
const config = computed(() => {
  return store.getUser?.brand?.configuration || {};
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

getCoords();
</script>

<style scoped lang="scss">
.map-dashboard {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
