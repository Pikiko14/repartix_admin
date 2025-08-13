<template>
  <q-form @submit="handlerSaveCity">
    <q-tabs v-model="tab" no-caps dense class="text-primary full-width q-pa-none">
      <q-tab name="city" :label="t('city')" />
      <q-tab name="zones" :label="t('zones')" />
    </q-tabs>

    <q-tab-panels class="full-width" v-model="tab" animated swipeable vertical transition-prev="jump-up"
      transition-next="jump-up">
      <!--City data-->
      <q-tab-panel name="city">
        <div class="row">
          <div class="col-12">
            <label class="text-dark" for="name">{{ t('city') }}</label>
            <q-input @update:model-value="loadLatAndLon" debounce="1500" dense id="name" :rules="[
              (val) => !!val || t('requiredField'),

            ]" outlined v-model="city.name" placeholder="New York"></q-input>
          </div>
          <div class="col-12 col-md-6" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
            <label class="text-dark" for="province">{{ t('province') }}</label>
            <q-input :rules="[
              (val) => !!val || t('requiredField'),
            ]" dense id="province" type="text" outlined v-model="city.province" placeholder="New York"></q-input>
          </div>
          <div class="col-12 col-md-6" :class="{ 'q-pl-sm': $q.screen.gt.sm }">
            <label class="text-dark" for="cod_city">{{ t('cod') }}</label>
            <q-input :rules="[
              (val) => !!val || t('requiredField'),

            ]" dense id="cod_city" mask="XXX" type="text" outlined v-model="city.cod_city" placeholder="NEW"></q-input>
          </div>
          <div class="col-12 col-md-6" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
            <label class="text-dark" for="lat">{{ t('lat') }}</label>
            <q-input readonly dense id="lat" type="text" outlined v-model="city.lat" placeholder="69.1234"></q-input>
          </div>

          <div class="col-12 col-md-6" :class="{ 'q-pl-sm': $q.screen.gt.sm }">
            <label class="text-dark" for="lon">{{ t('lon') }}</label>
            <q-input readonly dense id="lon" type="text" outlined v-model="city.lon" placeholder="102.2365"></q-input>
          </div>

          <div class="col-12 q-mt-lg relative map-section" v-if="center.lat > 0">
            <GoogleMap :api-key="user.brand.configuration.gmap_api__key" style="width: 100%; height: 150px"
              mapTypeId="terrain" :center="center" :zoom="9">
              <Rectangle :options="rectangle" />
            </GoogleMap>
            <div class="full-width absolute-top full-height"></div>
          </div>
        </div>
      </q-tab-panel>
      <!--End city data-->

      <!--Zones data-->
      <q-tab-panel name="zones">
        <div class="row">
          <div class="col-12">
            <q-scroll-area v-if="city.zones.length > 0" style="width: 100%; height: 260px">
              <div class="row">
                <div class="col-12" v-for="(zone, index) in city.zones" :key="index">
                  <div class="row">
                    <div class="col-12 col-md-4" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
                      <label class="text-dark" for="name">{{ t('name') }}</label>
                      <q-input dense id="name" :rules="[
                        (val) => !!val || t('requiredField'),

                      ]" outlined v-model="zone.name" placeholder="The Bronx"></q-input>
                    </div>
                    <div class="col-12 col-md-4" :class="{ 'q-px-sm': $q.screen.gt.sm }">
                      <label class="text-dark" for="cod">{{ t('cod') }}</label>
                      <q-input dense id="cod" :rules="[
                        (val) => !!val || t('requiredField'),

                      ]" outlined v-model="zone.cod_zone" placeholder="BRN"></q-input>
                    </div>
                    <div class="col-12 col-md-4 relative" :class="{ 'q-pl-sm': $q.screen.gt.sm }">
                      <label class="text-dark" for="price">{{ t('price') }}</label>
                      <q-input dense id="price" :rules="[
                        (val) => !!val || t('requiredField'),

                      ]" outlined type="number" v-model="zone.price" placeholder="1.5"></q-input>
                      <q-btn @click="removeZone(index)" icon="close" size="8pt" color="red" flat dense rounded class="absolute-top-right"></q-btn>
                    </div>
                  </div>
                </div>
              </div>
            </q-scroll-area>
          </div>
          <div class="col-12 text-center">
            <q-btn @click="addZone" unelevated :label="t('add')"></q-btn>
          </div>
        </div>
      </q-tab-panel>
      <!--End zones data-->
    </q-tab-panels>

    <div class="col-12 q-px-md d-flex content-between">
      <div class="div back-div">
        <q-btn unelevated outline @click="backTab" size="md" no-caps rounded v-if="tab !== 'city'" :label="t('back')"
          color="primary"></q-btn>
      </div>
      <q-btn v-if="tab === 'zones'" :loading="loading" unelevated size="md" type="submit" no-caps rounded
        :label="t('save')" color="primary"></q-btn>
      <q-btn v-else unelevated @click="nextTab" size="md" no-caps rounded :label="t('next')" color="primary"></q-btn>
    </div>
  </q-form>
</template>

<script setup>
// imports
import { useI18n } from 'vue-i18n';
import { ref, computed } from 'vue';
import { useAuthStore } from 'src/stores/authStore';
import { notification } from 'src/boot/notification';
import { GoogleMap, Rectangle } from 'vue3-google-map';
import { citiesContent } from 'src/composables/citiesContent';

// computed
const user = computed(() => {
  return store.getUser;
});

// references
const city = ref({
  zones: [],
  name: '',
  province: '',
  cod_city: '',
  lat: 0,
  lon: 0
});
const { t } = useI18n();
const tab = ref('city');
const rectangle = ref({
  bounds: {},
  editable: false,
  draggable: false,
  strokeColor: "#FF0000",
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: "#FF0000",
  fillOpacity: 0.35
})
const loading = ref(false);
const store = useAuthStore();
const content = citiesContent();
const center = ref({ lat: 0, lng: 0 });

// emits
const emit = defineEmits(['close-modal', 'up-total-item']);

// methods
const handlerSaveCity = async () => {
  loading.value = true;
  if (city.value._id) {
    await handlerUpdateCity();
    return;
  }
  try {
    const response = await content.doCreateCities(city.value);
    if (response && response.success) {
      notification('success', t('cityCreateSuccess'), 'primary');
      emit('close-modal');
      emit('up-total-item');
    }
  } finally {
    loading.value = false;
  }
}

const handlerUpdateCity = async () => {}

const loadLatAndLon = async (cityName) => {
  const { brand } = user.value;

  if (!brand || !brand.configuration || !brand.configuration.enable_google_map || !brand.configuration.gmap_api__key) return;
  center.value = { lat: 0, lng: 0 };
  fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${cityName}&key=${brand.configuration.gmap_api__key}`)
    .then(res => res.json())
    .then(data => {
      if (data.status === "OK") {
        const { lat, lng } = data.results[0].geometry.location;
        city.value.lat = lat;
        city.value.lon = lng;

        const boundsData = data.results[0].geometry.bounds;
        center.value = { lat, lng };
        rectangle.value.bounds = {
          north: boundsData.northeast.lat,
          south: boundsData.southwest.lat,
          east: boundsData.northeast.lng,
          west: boundsData.southwest.lng
        };
      } else {
        console.error("Error:", data.status);
      }
    });
}

const backTab = () => {
  tab.value = 'city';
}

const nextTab = () => {
  tab.value = 'zones';
}

const addZone = () => {
  city.value.zones.push({
    name: '',
    cod_zone: '',
    price: '',
  });
}

const removeZone = (idx) => {
  city.value.zones.splice(idx, 1);
}
</script>

<style scoped lang="scss">
.map-section {
  height: 160px;
}
</style>
