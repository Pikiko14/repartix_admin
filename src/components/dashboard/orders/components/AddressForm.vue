<template>
  <q-form @submit="handlerSaveAddress" class="row">
    <div class="col-12">
      <label for="address">{{ t('address') }}</label>
      <q-input id="address" @update:model-value="searchAddress" placeholder="Carrera # 81 # 6S - 51" outlined dense
        v-model="address.address" :rules="[(val) => !!val || t('requiredField')]" debounce="1500">
      </q-input>
      <q-list class="q-px-none" dense>
        <q-item class="q-px-none" tag="label" v-ripple v-for="(address, idx) in addressOptions" :key="idx">
          <q-item-section avatar>
            <q-radio @update:model-value="setAddress(address)" v-model="addressSelected"
              :val="address.value" color="primary" />
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

    <div class="col-12">
      <label class="text-dark" for="complement">{{ t('complement') }}</label>
      <q-input dense id="complement" :rules="[
        (val) => !!val || t('requiredField'),

      ]" outlined v-model="address.complement" placeholder="Apto 18 - 02"></q-input>
    </div>

    <div class="col-12 q-mt-md" v-if="address.coords.lat">
      <GoogleMap @click="setCords" :api-key="user.brand.configuration.gmap_api__key" style="width: 100%; height: 220px"
        :center="center" :zoom="17">
        <Marker v-if="render" :options="markerOptions" />
      </GoogleMap>
    </div>

    <div class="col-12 q-mt-md text-center">
      <q-btn :loading="loading" :disabled="!address.coords.lat || !address.address || !address.complement" unelevated size="md" :label="t('save')" type="submit" no-caps color="primary" rounded></q-btn>
    </div>
  </q-form>
</template>

<script setup>
// imports
import { useI18n } from 'vue-i18n';
import { Utils } from 'src/utils/utils';
import { ref, computed, defineProps } from 'vue';
import { useAuthStore } from 'src/stores/authStore';
import { GoogleMap, Marker } from 'vue3-google-map';
import { sendersContent } from 'src/composables/sendersContent';

// props
const props = defineProps({
  senderSelected: {
    type: Object,
    default: () => {},
  }
});

// references
const address = ref({
  address: '',
  complement: '',
  coords: {
    lat: null,
    lng: null,
  }
});
const { t } = useI18n();
const util = new Utils();
const render = ref(false);
const loading = ref(false);
const store = useAuthStore();
const addressOptions = ref([]);
const addressSelected = ref('');
const senderContent = sendersContent();
const center = ref({ lat: 0, lng: 0 });
const markerOptions = ref({ position: center, label: 'L', title: 'LADY LIBERTY' });

// computed
const user = computed(() => {
  return store.getUser;
});

// emit
const emit = defineEmits(['close-modal']);


// methods
const handlerSaveAddress = async () => {
  const sender = JSON.parse(JSON.stringify(props.senderSelected));
  sender.sender_info.address.push(address.value);
  loading.value = true;
  try {
    await senderContent.doUpdateSender(sender);
    emit('close-modal', sender);
  } catch (error) {
    console.log(error)
  } finally{
    loading.value = false;
  }
}

const searchAddress = async (e) => {
  const data = await util.loadAddressFormGMap(e);
  if (data.results && data.results.length > 0) {
    addressOptions.value = data.results.map((item) => {
      return {
        label: item?.formatted_address,
        value: item?.formatted_address,
        coords: {
          lat: item?.geometry.location.lat,
          lng: item?.geometry.location.lng,
        }
      }
    });
  }
}

const setAddress = (e) => {
  address.value.coords = e.coords;
  center.value = { lat: e.coords.lat, lng: e.coords.lng };
  markerOptions.value.position = center.value;
  reRender();
}

const setCords = (e) => {
  markerOptions.value.position = { lat: e.latLng.lat(), lng: e.latLng.lng() };
  address.value.coords = {
    lat: e.latLng.lat(),
    lng: e.latLng.lng()
  }
  reRender();
}

const reRender = () => {
  render.value = false;
  setTimeout(() => render.value = true, 500)
}
</script>
