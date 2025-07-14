<template>
  <section class="map-section">
    <q-form @submit="handlerSaveMapConfiguration" class="row">
      <div class="col-12">
        <q-toggle @update:model-value="clearKey" left-label :label="gMapConfig.enable_google_map ? t('unableGoogleMap') : t('enableGoogleMap')"
          v-model="gMapConfig.enable_google_map" checked-icon="check" color="primary" unchecked-icon="clear" />
      </div>
      <div class="col-12" v-if="gMapConfig.enable_google_map">
        <label class="text-dark" for="gMapKey">{{ t('gMapKey') }}</label>
        <q-input dense id="gMapKey" :rules="[
          (val) => val.length > 0 || t('requiredField'),

        ]" outlined v-model="gMapConfig.gmap_api__key" placeholder="gma-12536877459985474595"></q-input>
      </div>
      <div class="col-12" v-if="gMapConfig.gmap_api__key && gMapConfig.enable_google_map">
        <GoogleMap :api-key="gMapConfig.gmap_api__key" mapId="map_preview_1" style="width: 100%; height: 200px"
          :center="center" :zoom="15">
          <Marker v-if="center.lat > 0" :options="markerOptions" />
        </GoogleMap>
      </div>
      <div class="col-12 text-right q-mt-md">
        <q-btn :loading="loading" unelevated size="md" type="submit" no-caps rounded :label="t('save')"
          color="primary"></q-btn>
      </div>
    </q-form>
  </section>
</template>

<script setup>
// imports
import { useI18n } from 'vue-i18n';
import { computed, onBeforeMount, ref } from 'vue';
import { GoogleMap, Marker } from 'vue3-google-map';
import { useAuthStore } from 'src/stores/authStore';
import { notification } from 'src/boot/notification';
import { authContent } from 'src/composables/authContent';

// references
const { t } = useI18n();
const gMapConfig = ref({
  enable_google_map: false,
  gmap_api__key: '', // AIzaSyDc2YKYXusS83QEgxbE-yUJQjqq_lfKi2g
});
const loading = ref(false);
const store = useAuthStore();
const authApi = authContent();
const center = ref({ lat: 0, lng: 0 });
const markerOptions = ref({ position: center.value, label: 'L', title: 'LADY LIBERTY' });

// computed
const user = computed(() => {
  return store.getUser;
});

// methods
const handlerSaveMapConfiguration = async () => {
  const params = gMapConfig.value;
  params.country = user.value.brand.configuration.country || '';
  params.currency = user.value.brand.configuration.currency || '';
  params.price_by_km = user.value.brand.configuration.price_by_km || 0;
  params.route_price_by_km = user.value.brand.configuration.route_price_by_km || false;

  loading.value = true;
  try {
    const response = await authApi.doUpdateBrandConfiguration(params);
    if (response && response.success) {
      notification('success', t('changeBrandConfigurationSuccess'), 'primary');
    }
  } finally {
    loading.value = false;
  }
}

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

const clearKey = (e) => {
  if (!e) {
    gMapConfig.value.gmap_api__key = '';
  }
}


// life cicly
onBeforeMount(async () => {
  // validate preview configuration
  const { brand } = user.value;
  if (brand) {
    gMapConfig.value = {
      enable_google_map: brand.configuration.enable_google_map || false,
      gmap_api__key: brand.configuration.gmap_api__key || '',
    };
  };

  // get coors
  if (gMapConfig.value.enable_google_map && gMapConfig.value.gmap_api__key) {
    await getCoords();
  }
});
</script>

<style lang="scss" scoped></style>
