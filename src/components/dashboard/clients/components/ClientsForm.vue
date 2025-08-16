<template>
  <q-form @submit="handlerSaveClient">
    <q-tabs v-model="tab" no-caps dense class="text-primary full-width q-pa-none">
      <q-tab name="personal" :label="t('personal')" />
      <q-tab name="address" :label="t('address')" />
    </q-tabs>

    <q-tab-panels class="full-width" v-model="tab" animated swipeable vertical transition-prev="jump-up"
      transition-next="jump-up">
      <q-tab-panel name="personal">
        <div class="row">
          <div class="col-12 col-md-6" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
            <label class="text-dark" for="name">{{ t('name') }}</label>
            <q-input :rules="[
              (val) => !!val || t('requiredField'),
            ]" dense id="name" type="text" outlined v-model="client.name" placeholder="Jhon"></q-input>
          </div>
          <div class="col-12 col-md-6" :class="{ 'q-pl-sm': $q.screen.gt.sm }">
            <label class="text-dark" for="lastName">{{ t('lastName') }}</label>
            <q-input :rules="[
              (val) => !!val || t('requiredField'),

            ]" dense id="lastName" type="text" outlined v-model="client.last_name" placeholder="Doe"></q-input>
          </div>
          <div class="col-12">
            <label class="text-dark" for="email">{{ t('email') }}</label>
            <q-input dense id="email" :rules="[
              (val) => !!val || t('requiredField'),
              (val) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/.test(val) || t('invalidEmail')
            ]" outlined v-model="client.email" placeholder="jhon@doe.com"></q-input>
          </div>
          <div class="col-12 col-md-6" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
            <label class="text-dark" for="phone">{{ t('phone') }}</label>
            <q-input mask="+## ##########" dense id="phone" :rules="[
              (val) => val.length > 0 || t('requiredField'),
              (val) => /^\+\d{1,3} ?\d{7,12}$/.test(val) || t('invalidPhone'),
            ]" outlined v-model="client.phone" placeholder="+57 3225361689">
            </q-input>
          </div>
          <div class="col-12 col-md-6" :class="{ 'q-pl-sm': $q.screen.gt.sm }">
            <label class="text-dark" for="dni">{{ t('dni') }}</label>
            <q-input :rules="[
              (val) => !!val || t('requiredField'),
            ]" dense id="dni" type="text" outlined v-model="client.dni" placeholder="181564525"
              mask="###############"></q-input>
          </div>
        </div>
      </q-tab-panel>

      <q-tab-panel name="address">
        <div class="row">
          <div class="col-12">
            <label class="text-dark" for="address">{{ t('address') }}</label>
            <q-input debounce="1500" @update:model-value="laodAddress" :rules="[
              (val) => !!val || t('requiredField'),
              (val) => val.length < 90 || t('maxLengthAddress'),
            ]" dense id="address" type="text" outlined v-model="search" placeholder="Cl 56 #38 - 52"></q-input>
          </div>
          <div class="col-12" v-if="addressOptions.length > 0">
            <q-list class="q-px-none" dense>
              <q-item class="q-px-none" tag="label" v-ripple v-for="(address, idx) in addressOptions" :key="idx">
                <q-item-section avatar>
                  <q-radio @update:model-value="setCenter(address)" v-model="client.address" :val="address.value" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="address-label">{{ address.label }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn color="primary" icon="map" flat dense rounded></q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <div class="col-12 q-mt-lg" v-if="center.lat > 0">
            <GoogleMap @click="setCords" :api-key="user.brand.configuration.gmap_api__key" style="width: 100%; height: 190px"
              :center="center" :zoom="17">
              <Marker :options="markerOptions" v-if="render" />
            </GoogleMap>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <div class="col-12 q-px-md d-flex content-between">
      <div class="div back-div">
        <q-btn unelevated outline @click="backTab" size="md" no-caps rounded v-if="tab !== 'personal'"
          :label="t('back')" color="primary"></q-btn>
      </div>
      <q-btn v-if="tab === 'address'" :disable="!client.address" :loading="loading" unelevated size="md" type="submit" no-caps rounded
        :label="t('save')" color="primary"></q-btn>
      <q-btn v-else unelevated @click="nextTab" size="md" no-caps rounded :label="t('next')" color="primary"></q-btn>
    </div>
  </q-form>
</template>

<script setup>
// imports
import { useI18n } from 'vue-i18n';
import { Utils } from 'src/utils/utils';
import { ref, computed, onBeforeMount } from 'vue';
import { useAuthStore } from 'src/stores/authStore';
import { notification } from 'src/boot/notification';
import { GoogleMap, Marker } from 'vue3-google-map';
import { clientsContent } from 'src/composables/clientsContent';

// props
const props = defineProps({
  clientSelected: {
    type: Object,
    default: () => { },
  }
});

// references
const render = ref(false);
const search = ref('');
const client = ref({
  name: '',
  last_name: '',
  email: '',
  phone: '',
  dni: '',
  address: '',
  coords: {
    lat: 0,
    lng: 0
  }
});
const { t } = useI18n();
const util = new Utils();
const loading = ref(false);
const tab = ref('personal');
const store = useAuthStore();
const addressOptions = ref([]);
const content = clientsContent();
const center = ref({ lat: 0, lng: 0 });
const markerOptions = ref({ position: center, label: 'L', title: 'LADY LIBERTY' });

// computed
const user = computed(() => {
  return store.getUser;
});

// emits
const emit = defineEmits(['close-modal', 'up-total-item']);

// methods
const handlerSaveClient = async () => {
  if (client.value.updatedAt) delete client.value.updatedAt;
  if (client.value.createdAt) delete client.value.createdAt;
  delete client.value.__v;
  client.value.dni = parseInt(client.value.dni);

  loading.value = true;
  if (client.value._id) {
    await handlerUpdateClient();
    return;
  }
  try {
    const response = await content.doCreateClients(client.value);
    if (response && response.success) {
      notification('success', t('clientCreateSuccess'), 'primary');
      emit('close-modal');
      emit('up-total-item');
    }
  } finally {
    loading.value = false;
  }
}

const handlerUpdateClient = async () => {
  try {
    const response = await content.doUpdateClients(client.value);
    if (response && response.success) {
      notification('success', t('clientUpdateSuccess'), 'primary');
      emit('close-modal');
    }
  } finally {
    loading.value = false;
  }
}

const backTab = () => {
  tab.value = 'personal';
}

const nextTab = () => {
  tab.value = 'address';
}

const laodAddress = async (string) => {
  const data = await util.loadAddressFormGMap(string);
  if (data && data.results && data.results.length > 0) {
    const { results } = data;
    addressOptions.value = results.map((el) => {
      return {
        label: el.formatted_address,
        value: el.formatted_address,
        location: el.geometry.location,
      }
    });
  }
}

const setCenter = (address) => {
  center.value = address.location;
  markerOptions.value.position = address.location;
  client.value.address = address.value;
  client.value.coords = address.location
  reRender();
}

const setCords = (e) => {
  markerOptions.value.position = { lat: e.latLng.lat(), lng: e.latLng.lng() };
  client.value.coords = {
    lat: e.latLng.lat(),
    lng: e.latLng.lng()
  }
  reRender();
}

const reRender = () => {
  render.value = false;
  setTimeout(() => {
    render.value = true;
  }, 500)
}

// hook
onBeforeMount(() => {
  if (props.clientSelected && props.clientSelected._id) {
    client.value = JSON.parse(JSON.stringify(props.clientSelected));

    if (client.value.address) {
      search.value = client.value.address;
      laodAddress(client.value.address);
    }
  }
});
</script>

<style scoped lang="scss">
.address-label {
  font-size: .9rem;
}
</style>
