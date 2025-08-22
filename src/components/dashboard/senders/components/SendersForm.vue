<template>
  <q-form @submit="handlerSaveSender">
    <q-tabs v-model="tab" no-caps dense class="text-primary full-width q-pa-none">
      <q-tab name="access" :label="t('access')" />
      <q-tab name="senders" :label="t('senderRem')" />
      <q-tab name="address" :label="t('address')" />
    </q-tabs>

    <q-tab-panels class="full-width" v-model="tab" animated swipeable vertical transition-prev="jump-up"
      transition-next="jump-up">
      <q-tab-panel class="q-pa-none q-px-md" name="access">
        <div class="row q-mt-md">
          <div class="col-12">
            <label class="text-dark" for="username">{{ t('username') }}</label>
            <q-input dense id="username" :rules="[
              (val) => !!val || t('requiredField'),

            ]" outlined v-model="sender.username" placeholder="jhondoe"></q-input>
          </div>

          <div class="col-12 col-md-6" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
            <label class="text-dark" for="password">{{ t('password') }}</label>
            <q-input dense id="password" :rules="sender._id ? [] : [
              (val) => !!val || t('requiredField'),
              (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/.test(val) || t('passwordStrong')
            ]" type="password" outlined v-model="sender.password" placeholder="*********"></q-input>
          </div>

          <div class="col-12 col-md-6" :class="{ 'q-pl-sm': $q.screen.gt.sm, 'q-mt-md': $q.screen.lt.md }">
            <label class="text-dark" for="password_confirm">{{ t('password_confirmation') }}</label>
            <q-input dense id="password_confirm" :rules="sender._id ? [] : [
              (val) => !!val || t('requiredField'),
              (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/.test(val) || t('passwordStrong'),
              (val) => val === sender.password || t('dontMatchPassword')
            ]" type="password" outlined v-model="sender.confirmation_password" placeholder="*********"></q-input>
          </div>

          <div class="col-12" :class="{ 'q-mt-md': sender._id }">
            <label class="text-dark" for="email">{{ t('email') }}</label>
            <q-input dense id="email" :rules="[
              (val) => !!val || t('requiredField'),
              (val) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/.test(val) || t('invalidEmail')
            ]" outlined v-model="sender.email" placeholder="jhon@doe.com"></q-input>
          </div>
        </div>
      </q-tab-panel>

      <q-tab-panel name="senders">
        <div class="row">
          <div class="col-12">
            <label class="text-dark" for="brand_name">{{ t('brandName') }}</label>
            <q-input dense id="brand_name" :rules="[
              (val) => !!val || t('requiredField'),

            ]" outlined v-model="sender.sender_info.brand_name" placeholder="RepartiX"></q-input>
          </div>

          <div class="col-12 col-md-6" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
            <label class="text-dark" for="manager">{{ t('manager') }}</label>
            <q-input dense id="manager" :rules="sender._id ? [] : [
              (val) => !!val || t('requiredField'),
            ]" outlined v-model="sender.sender_info.manager" placeholder="Jhon Doe"></q-input>
          </div>

          <div class="col-12 col-md-6" :class="{ 'q-pl-sm': $q.screen.gt.sm, 'q-mt-md': $q.screen.lt.md }">
            <label class="text-dark" for="brand_phone">{{ t('phone') }}</label>
            <q-input mask="+## ##########" dense id="phone" :rules="[
              (val) => val.length > 0 || t('requiredField'),
              (val) => /^\+\d{1,3} ?\d{7,12}$/.test(val) || t('invalidPhone'),
            ]" outlined v-model="sender.sender_info.brand_phone" placeholder="+57 3225361689">
            </q-input>
          </div>
        </div>
      </q-tab-panel>

      <q-tab-panel name="address">
        <div class="row">
          <div class="col-12" v-for="(address, index) in sender.sender_info.address" :key="index">
            <div class="row">
              <div class="col-12 col-md-6" @click="selectedIndex = index; addressOptions = []"
                :class="{ 'q-pr-sm': $q.screen.gt.sm }">
                <label class="text-dark" for="address">{{ t('address') }}</label>
                <q-input debounce="1500" @update:model-value="searchAddress" dense id="address" :rules="[
                  (val) => !!val || t('requiredField'),

                ]" outlined v-model="address.address" placeholder="Calle 51 #6A - 57"></q-input>

                <q-menu v-model="showAddressMenu" v-if="selectedIndex === index">
                  <q-list class="q-px-none" dense>
                    <q-item class="q-px-none" tag="label" v-ripple v-for="(address, idx) in addressOptions" :key="idx">
                      <q-item-section avatar>
                        <q-radio @update:model-value="setCenter(address, index)"
                          v-model="sender.sender_info.address[index].address" :val="address.value" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="address-label">{{ address.label }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-btn color="primary" icon="map" flat dense rounded></q-btn>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </div>
              <div class="col-12 col-md-5" :class="{ 'q-px-sm': $q.screen.gt.sm }">
                <label class="text-dark" for="complement">{{ t('complement') }}</label>
                <q-input dense id="complement" :rules="[
                  (val) => !!val || t('requiredField'),

                ]" outlined v-model="address.complement" placeholder="Apto 18 - 02"></q-input>
              </div>
              <div class="col-12 q-pl-sm col-md-1 relative relative flex-items-center">
                <q-btn size="8pt" @click="openMap(address, index)" flat dense rounded icon="map" color="primary">
                  <q-tooltip class="bg-primary">
                    {{ t('showMap') }}
                  </q-tooltip>
                </q-btn>
                <q-btn size="8pt" @click="deleteAddress(index)" flat dense rounded icon="delete" color="red">
                  <q-tooltip class="bg-red">
                    {{ t('delete') }}
                  </q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
          <div class="col-12 text-center">
            <q-btn @click="addAddress" unelevated :label="t('add')"></q-btn>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <div class="col-12 q-px-md d-flex content-between">
      <div class="div back-div">
        <q-btn unelevated outline @click="backTab" size="md" no-caps rounded v-if="tab !== 'access'"
          :label="t('back')" color="primary"></q-btn>
      </div>
      <q-btn v-if="tab === 'address'" :disable="sender.sender_info.address.length === 0" :loading="loading" unelevated
        size="md" type="submit" no-caps rounded :label="t('save')" color="primary"></q-btn>
      <q-btn v-else unelevated @click="nextTab" size="md" no-caps rounded :label="t('next')" color="primary"></q-btn>
    </div>

    <q-dialog v-model="showMapModal">
      <q-card>
        <q-card-section>
          <div class="row">
            <div class="col-11">
              <p class="text-h6 text-bold">
                {{ selectedAddress.address }}.
              </p>
            </div>
            <div class="col-1">
              <q-btn icon="close" v-close-popup flat dense rounded color="red"></q-btn>
            </div>
            <div class="col-12 q-mt-md">
              <GoogleMap @click="setCords" :api-key="user.brand.configuration.gmap_api__key"
                style="width: 100%; height: 390px" :center="center" :zoom="17">
                <Marker :options="markerOptions" v-if="render" />
              </GoogleMap>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-form>
</template>

<script setup>
// imports
import { useI18n } from 'vue-i18n';
import { Utils } from 'src/utils/utils';
import { ref, onBeforeMount, computed } from 'vue';
import { GoogleMap, Marker } from 'vue3-google-map';
import { useAuthStore } from 'src/stores/authStore';
import { notification } from 'src/boot/notification';
import { sendersContent } from 'src/composables/sendersContent';

// props
const props = defineProps({
  senderSelected: {
    type: Object,
    default: () => { },
  }
});

// references
const render = ref(false);
const sender = ref({
  type_user: 'sender',
  profile: {},
  sender_info: {
    address: [],
    brand_name: '',
    brand_phone: '',
    manager: '',
  },
});
const { t } = useI18n();
const util = new Utils();
const tab = ref('access');
const loading = ref(false);
const store = useAuthStore();
const addressOptions = ref([]);
const showMapModal = ref(false);
const selectedIndex = ref(null);
const selectedAddress = ref({});
const content = sendersContent();
const showAddressMenu = ref(false);
const center = ref({ lat: 0, lng: 0 });
const markerOptions = ref({ position: center, label: 'L', title: 'LADY LIBERTY' });

// computed
const user = computed(() => {
  return store.getUser;
});

// emits
const emit = defineEmits(['close-modal', 'up-total-item']);

// methods
const handlerSaveSender = async () => {
  if (sender.value.updatedAt) delete sender.value.updatedAt;
  if (sender.value.createdAt) delete sender.value.createdAt;

  if (sender.value.sender_info.updatedAt) delete sender.value.sender_info.updatedAt;
  if (sender.value.sender_info.createdAt) delete sender.value.sender_info.createdAt;

  delete sender.value.__v;
  sender.value.profile = {
    full_name: sender.value.sender_info.manager,
    phone: sender.value.sender_info.brand_phone,
  }

  loading.value = true;
  if (sender.value._id) {
    await handlerUpdateSender();
    return;
  }
  try {
    const response = await content.doCreateSender(sender.value);
    if (response && response.success) {
      notification('success', t('sendersCreateSuccess'), 'primary');
      emit('close-modal', response);
      emit('up-total-item');
    }
  } finally {
    loading.value = false;
  }
}

const handlerUpdateSender = async () => {
  try {
    const response = await content.doUpdateSender(sender.value);
    if (response && response.success) {
      notification('success', t('sendersUpdateSuccess'), 'primary');
      emit('close-modal');
    }
  } finally {
    loading.value = false;
  }
}

const nextTab = () => {
  if (tab.value === 'access') {
    tab.value = 'senders';
  } else if (tab.value === 'senders') {
    tab.value = 'address';
  }
}

const backTab = () => {
  if (tab.value === 'address') {
    tab.value = 'senders';
  } else if (tab.value === 'senders') {
    tab.value = 'access';
  }
}

const addAddress = () => {
  sender.value.sender_info.address.push({
    address: '',
    complement: '',
    coords: {
      lat: null,
      lng: null,
    }
  });
}

const openMap = (address, index) => {
  selectedAddress.value = address;
  center.value = address.coords;
  markerOptions.value.position = address.coords;
  showMapModal.value = !showMapModal.value;
  render.value = true;
  selectedIndex.value = index;
}

const searchAddress = async (e) => {
  const data = await util.loadAddressFormGMap(e);
  if (data.results && data.results.length > 0) {
    addressOptions.value = data.results.map((item) => {
      return {
        label: item.formatted_address,
        value: item.formatted_address,
        coords: {
          lat: item.geometry.location.lat,
          lng: item.geometry.location.lng,
        }
      }
    });
    showAddressMenu.value = true;
  }
}

const setCenter = (address, index) => {
  sender.value.sender_info.address[index].coords = address.coords;
  selectedIndex.value = null;
  showAddressMenu.value = false;
}

const deleteAddress = (index) => {
  sender.value.sender_info.address.splice(index, 1);
}

const setCords = (e) => {
  markerOptions.value.position = { lat: e.latLng.lat(), lng: e.latLng.lng() };
  sender.value.sender_info.address[selectedIndex.value].coords = {
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
  if (props.senderSelected && props.senderSelected._id) {
    sender.value = JSON.parse(JSON.stringify(props.senderSelected));
  }
});
</script>

<style scoped lang="scss">
.address-label {
  font-size: .9rem;
}
</style>
