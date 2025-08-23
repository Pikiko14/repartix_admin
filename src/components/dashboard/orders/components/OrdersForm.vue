<template>
  <q-form @submit="handlerSaveOrder">
    <q-tabs v-model="tab" no-caps dense class="text-primary full-width q-pa-none">
      <q-tab name="general" :label="t('general')" />
      <q-tab name="sender" :label="t('sender').substring(0, 9)" />
      <q-tab name="client" :label="t('client').substring(0, 7)" />
      <q-tab name="products" :label="t('products')" />
    </q-tabs>

    <q-tab-panels class="full-width" v-model="tab" animated swipeable vertical transition-prev="jump-up"
      transition-next="jump-up">
      <!--General-->
      <q-tab-panel name="general">
        <div class="row">
          <div class="col-12 col-md-6" :class="{ 'q-pr-sm': $q.screen.gt.sm }" v-if="!configuration.route_price_by_km">
            <label for="city">{{ t('city') }}</label>
            <q-select @update:model-value="getZones" :label="t('selectOneOptions')" outlined dense
              :rules="[(val) => !!val || t('requiredField')]" id="city" :options="cities"
              v-model="city"></q-select>
          </div>

          <div class="col-12 col-md-6" :class="{ 'q-pl-sm': $q.screen.gt.sm }" v-if="!configuration.route_price_by_km">
            <label for="city">{{ t('zones').substring(0, 4) }}</label>
            <q-select @update:model-value="setZone" :label="t('selectOneOptions')" outlined dense :rules="[(val) => !!val || t('requiredField')]" id="city" :options="zones" v-model="zone"></q-select>
          </div>

          <div class="col-12">
            <label for="scheduleDate">{{ t('scheduled_date') }}</label>
            <q-input id="scheduleDate" :rules="[(val) => !!val || t('requiredField')]" @click="dateReference.toggle()"
              placeholder="####/##/##" outlined dense v-model="order.scheduled_date">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="dateReference" cover transition-show="scale" transition-hide="scale">
                    <q-date :options="validDates" v-model="order.scheduled_date"
                      @update:model-value="dateReference.toggle()"></q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-3" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
            <label for="cashOnDelivery">{{ t('cashOnDelivery') }}</label><br />
            <q-toggle id="cashOnDelivery" :label="order.cash_on_delivery ? t('yes') : t('no')"
              v-model="order.cash_on_delivery" />
          </div>

          <div class="col-12 col-md-9" v-if="order.cash_on_delivery" :class="{ 'q-pl-sm': $q.screen.gt.sm }">
            <label for="cashAmount">{{ t('cashAmount') }}</label><br />
            <q-input v-money="money" id="cashAmount" :rules="[(val) => !!val || t('requiredField')]"
              placeholder="15.000,00" outlined dense v-model="order.cash_amount" />
          </div>

          <div class="col-12 q-mb-md">
            <label for="cashAmount">{{ t('notes') }}</label><br />
            <q-input counter maxlength="300" type="textarea" id="notes" :placeholder="t('notes')" outlined dense
              v-model="order.notes" />
          </div>
        </div>
      </q-tab-panel>
      <!--end general-->

      <!--Sender-->
      <q-tab-panel name="sender">
        <div class="row">
          <div class="col-12" v-if="!order.sender.brand_name">
            <label for="sender">{{ t('sender').substring(0, 9) }}</label><br />
            <q-input debounce="1500" :loading="loadingSender" @update:model-value="loadSenders" id="sender"
              :placeholder="t('searchSender')" outlined dense v-model="senderSearch">
              <template v-slot:append>
                <q-btn @click="openModalAdd('sender')" icon="add" color="primary" flat dense rounded>
                  <q-tooltip class="bg-primary text-white">
                    {{ t('add') }}
                  </q-tooltip>
                </q-btn>
              </template>
            </q-input>
            <q-menu fit v-model="showSenderMenu" v-if="senders.length > 0">
              <q-list class="q-px-none" dense>
                <q-item class="q-px-none" tag="label" v-ripple v-for="(sender, idx) in senders" :key="idx">
                  <q-item-section avatar>
                    <q-radio @update:model-value="setSender" v-model="senderSelected" :val="sender" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="address-label">{{ sender?.sender_info?.brand_name }}</q-item-label>
                    <q-item-label caption>{{ sender?.sender_info?.brand_phone }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </div>
          <div class="col-12 col-md-6" v-if="order.sender.brand_name" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
            <label for="brandName">{{ t('brandName') }}</label>
            <q-input id="brandName" v-model="order.sender.brand_name" readonly dense outlined />
          </div>
          <div class="col-12 col-md-6" v-if="order.sender.brand_name" :class="{ 'q-pl-sm': $q.screen.gt.sm }">
            <label for="brandPhone">{{ t('phone') }}</label>
            <q-input id="brandPhone" v-model="order.sender.brand_phone" readonly dense outlined />
          </div>
          <div class="col-12 q-mt-lg" v-if="order.sender.brand_name">
            <label for="address">{{ t('address') }}es</label><br />
            <q-list class="q-px-none" dense>
              <q-item class="q-px-none" tag="label" v-ripple v-for="(address, idx) in order.sender.optionsAddress"
                :key="idx">
                <q-item-section avatar>
                  <q-radio @update:model-value="setSenderAddress" v-model="selectedAddress" :val="address"
                    color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    {{ address.address }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <div class="col-12 q-mt-lg text-center" v-if="order.sender.brand_name">
            <q-btn @click="openModalAdd('address')" no-caps :label="t('otherAddress')" unelevated color="primary" rounded></q-btn>
          </div>
          <div class="col-12 q-mt-md text-center" v-if="order.sender.brand_name">
            <q-btn no-caps @click="clearSenderAddress" outline :label="t('otherSender')" color="primary" rounded></q-btn>
          </div>
        </div>
      </q-tab-panel>
      <!--end sender-->

      <!--Client-->
      <q-tab-panel name="client">
        <div class="row">
          <div class="col-12" v-if="!order.client.name">
            <label for="sender">{{ t('client').substring(0, 7) }}</label>
            <q-input debounce="1500" :loading="loadingCLient" @update:model-value="loadsClients" id="sender"
              :placeholder="t('searchClient')" outlined dense v-model="clientSearch">
              <template v-slot:append>
                <q-btn @click="openModalAdd('client')" icon="add" color="primary" flat dense rounded>
                  <q-tooltip class="bg-primary text-white">
                    {{ t('add') }}
                  </q-tooltip>
                </q-btn>
              </template>
            </q-input>
            <q-menu fit v-model="showClientMenu" v-if="clients.length > 0">
              <q-list class="q-px-none" dense>
                <q-item class="q-px-none" tag="label" v-ripple v-for="(client, idx) in clients" :key="idx">
                  <q-item-section avatar>
                    <q-radio @update:model-value="setClient" v-model="clientSelected" :val="client" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="address-label">{{ `${client.name} ${client.last_name}` }}</q-item-label>
                    <q-item-label caption>{{ client?.address }}</q-item-label>
                    <q-item-label caption>{{ client?.phone }} | {{ client?.email }} | {{ client?.dni }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </div>

          <div class="col-12 col-md-6" v-if="order.client.name" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
            <label for="name">{{ t('name') }}</label>
            <q-input readonly id="name" :rules="[(val) => !!val || t('requiredField')]" outlined dense v-model="order.client.name" />
          </div>

          <div class="col-12 col-md-6" v-if="order.client.name" :class="{ 'q-pl-sm': $q.screen.gt.sm }">
            <label for="lastName">{{ t('lastName') }}</label>
              <q-input readonly id="lastName" :rules="[(val) => !!val || t('requiredField')]" outlined dense v-model="order.client.last_name" />
          </div>

          <div class="col-12" v-if="order.client.name">
            <label for="address">{{ t('address') }}</label>
              <q-input readonly id="address" :rules="[(val) => !!val || t('requiredField')]" outlined dense v-model="order.client.address" />
          </div>

          <div class="col-12 col-md-6" v-if="order.client.name" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
            <label for="phone">{{ t('phone') }}</label>
            <q-input readonly id="phone" :rules="[(val) => !!val || t('requiredField')]" outlined dense v-model="order.client.phone" />
          </div>

          <div class="col-12 col-md-6" v-if="order.client.name" :class="{ 'q-pl-sm': $q.screen.gt.sm }">
            <label for="email">{{ t('email') }}</label>
              <q-input readonly id="email" :rules="[(val) => !!val || t('requiredField')]" outlined dense v-model="order.client.email" />
          </div>

          <div class="col-12" v-if="order.client.name">
            <label for="dni">{{ t('dni') }}</label>
              <q-input readonly id="dni" :rules="[(val) => !!val || t('requiredField')]" outlined dense v-model="order.client.dni" />
          </div>

          <div class="col-12 q-mt-lg" v-if="order.client.name">
            <GoogleMap @click="setCords" :api-key="configuration.gmap_api__key" style="width: 100%; height: 220px"
              :center="center" :zoom="17">
              <Marker :options="markerOptions" />
            </GoogleMap>
          </div>
        </div>
      </q-tab-panel>
      <!--End client-->
    </q-tab-panels>

    <div class="col-12 q-px-md d-flex content-between">
      <div class="div back-div">
        <q-btn unelevated outline @click="backTab" size="md" no-caps rounded v-if="tab !== 'general'" :label="t('back')"
          color="primary"></q-btn>
      </div>
      <q-btn v-if="tab === 'products'" :disable="!order.client" :loading="loading" unelevated size="md" type="submit"
        no-caps rounded :label="t('save')" color="primary"></q-btn>
      <q-btn v-else unelevated @click="nextTab" size="md" no-caps rounded :label="t('next')" color="primary"></q-btn>
    </div>

    <q-dialog position="right" v-model="formAdd">
      <ModalCard :title="formEnable === 'sender' ? t('sendersCreate') : formEnable === 'address' ? t('address') : t('clientCreate')">
        <template #body>
          <SendersForm v-if="formEnable === 'sender'" :sender-selected="senderSelected" @close-modal="closeModalAdd" />
          <AddressForm :senderSelected="senderSelected" v-if="formEnable === 'address'" @close-modal="closeModalAdd" />
        </template>
      </ModalCard>
    </q-dialog>
  </q-form>
</template>

<script setup>
// imports
import { date } from 'quasar';
import { VMoney } from 'v-money';
import { useI18n } from 'vue-i18n';
import AddressForm from './AddressForm.vue';
import { GoogleMap, Marker } from 'vue3-google-map';
import { useAuthStore } from 'src/stores/authStore';
import { notification } from 'src/boot/notification';
import { useCitiesStore } from 'src/stores/citiesStore';
import { useSendersStore } from 'src/stores/sendersStore';
import { useClientsStore } from 'src/stores/clientsStore';
import { citiesContent } from 'src/composables/citiesContent';
import { ordersContent } from 'src/composables/ordersContent';
import ModalCard from 'src/components/partials/ModalCard.vue';
import { sendersContent } from 'src/composables/sendersContent';
import { clientsContent } from 'src/composables/clientsContent';
import { ref, onBeforeMount, computed, onBeforeUnmount } from 'vue';
import SendersForm from 'src/components/dashboard/senders/components/SendersForm.vue';

// props
const props = defineProps({
  orderSelected: {
    type: Object,
    default: () => { },
  }
});

// references
const timeStamp = Date.now();
const formattedString = date.formatDate(timeStamp, 'YYYY-MM-DD');
const money = {
  decimal: ',',
  thousands: '.',
  prefix: '',
  suffix: ' ',
  precision: 2
}
const order = ref({
  date: '',
  scheduled_date: formattedString,
  products: [
    {
      name: "",
      description: "",
      quantity: null,
      unit_price: null,
      total_price: null,
      weight: 1
    }
  ],
  client: {
    name: "",
    last_name: "",
    address: "",
    phone: "",
    email: "",
    dni: "",
    coords: {
      lat: null,
      lng: null
    }
  },
  sender: {
    brand_name: "",
    brand_phone: "",
    address: {
      address: "",
      complement: "",
      coords: {
        "lat": null,
        "lng": null
      }
    }
  },
  courier: {
    full_name: "",
    vehicle_type: "",
    license_plate: ""
  },
  cash_on_delivery: false,
  cash_amount: 0,
  settled_to_sender: false,
  notes: "",
  order_price: 0,
});
const city = ref('');
const zone = ref('');
const zones = ref([]);
const { t } = useI18n();
const formAdd = ref(false);
const formEnable = ref('');
const loading = ref(false);
const tab = ref('general');
const dateReference = ref();
const senderSearch = ref('');
const clientSearch = ref('');
const senderSelected = ref({});
const clientSelected = ref({});
const content = ordersContent();
const selectedAddress = ref({});
const loadingSender = ref(false);
const loadingCLient = ref(false);
const authStore = useAuthStore();
const showSenderMenu = ref(false);
const showClientMenu = ref(false);
const cityContent = citiesContent();
const citiesStore = useCitiesStore();
const storeSender = useSendersStore();
const storeClient = useClientsStore();
const senderContent = sendersContent();
const clientContent = clientsContent();
const center = ref({ lat: 0, lng: 0 });
const tabsOrder = ['general', 'sender', 'client', 'products', 'address'];
const markerOptions = ref({ position: center, label: 'L', title: 'LADY LIBERTY' });

// emits
const emit = defineEmits(['close-modal', 'up-total-item']);

//computed
const cities = computed(() => citiesStore.getCities.map(city => {
  return { label: city.name, value: city.name, zones: city.zones }
}));
const senders = computed(() => storeSender.getSenders);
const configuration = computed(() => authStore.getUser.brand.configuration || {});
const clients = computed(() => storeClient.getClients);


// methods
const handlerSaveOrder = async () => {
  const timeStamp = Date.now()
  const formattedString = date.formatDate(timeStamp, 'YYYY-MM-DDTHH:mm:ss.SSSZ')

  order.value.date = formattedString;
  order.value.client.dni = order.value.client.dni.toString();
  delete order.value.sender.optionsAddress;

  loading.value = true;
  try {
    const response = await content.doCreateOrder(order.value);
    if (response && response.success) {
      notification('success', t('clientCreateSuccess'), 'primary');
      emit('close-modal');
      emit('up-total-item');
    }
  } finally {
    loading.value = false;
  }
}

const backTab = () => {
  const index = tabsOrder.indexOf(tab.value);
  if (index > 0) {
    tab.value = tabsOrder[index - 1];
  }
}

const nextTab = () => {
  const index = tabsOrder.indexOf(tab.value);
  if (index < tabsOrder.length - 1) {
    tab.value = tabsOrder[index + 1];
  }
}

const validDates = (date) => {
  const today = new Date();
  const selected = new Date(date);

  today.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);

  return selected >= today;
};

const loadSenders = async (e) => {
  if (e.trim() === '') return;
  loadingSender.value = true;
  try {
    await senderContent.doListSenders(`page=1&perPage=20&search=${e}`);
    if (senders.value.length > 0) {
      showSenderMenu.value = true;
    }
  } finally {
    loadingSender.value = false;
  }
}

const setSender = (sender) => {
  order.value.sender.brand_name = sender.sender_info.brand_name;
  order.value.sender.brand_phone = sender.sender_info.brand_phone;
  order.value.sender.optionsAddress = sender.sender_info.address;

  showSenderMenu.value = false;
}

const setSenderAddress = (address) => {
  order.value.sender.brand_name = senderSelected.value?.sender_info?.brand_name;
  order.value.sender.brand_phone = senderSelected.value?.sender_info?.brand_phone;
  order.value.sender.address = {
    address: address?.address,
    complement: address?.complement,
    coords: {
      "lat": address?.coords?.lat,
      "lng": address?.coords?.lng
    }
  }
}

const clearSenderAddress = () => {
  senderSelected.value = {};
  order.value.sender = {
    brand_name: "",
    brand_phone: "",
    address: {
      address: "",
      complement: "",
      coords: {
        "lat": null,
        "lng": null
      }
    }
  }
  senderSearch.value = '';
  showSenderMenu.value = false;
  storeSender.clearSenders();
}

const getZones = (e) => {
  order.value.city = e.label;
  zones.value = e.zones.map((z) => {
    return {
      label: z.name,
      value: z.name,
      price: z.price,
      cod_zone: z.cod_zone
    }
  });
}

const setZone = (e) => {
  order.value.zone = {
    name: e.label,
    price: e.price,
    cod_zone: e.cod_zone
  }
}

const openModalAdd = (type) => {
  formEnable.value = type;
  formAdd.value = !formAdd.value;
}

const closeModalAdd = (e) => {
  if (formEnable.value === 'sender') {
    senderSearch.value = e?.user?.sender_info?.brand_name;
    senderSelected.value = e?.user;
    order.value.sender = {
      brand_name: e?.user?.sender_info?.brand_name,
      brand_phone: e?.user?.sender_info?.brand_phone,
      optionsAddress: e?.user?.sender_info?.address
    }
  }

  if (formEnable.value === 'address') {
    console.log(e);
    senderSelected.value = e;
    order.value.sender.optionsAddress = e?.sender_info?.address;
  }

  formAdd.value = !formAdd.value;
  formEnable.value = '';
}

const loadsClients = async (e) => {
  if (e.trim() === '') return;
  loadingCLient.value = true;
  try {
    await clientContent.doListClients(`page=1&perPage=20&search=${e}`);
    if (clients.value.length > 0) {
      showClientMenu.value = true;
    }
  } finally {
    loadingCLient.value = false;
  }
}

const setClient = (client) => {
  order.value.client = {
    name: client.name,
    last_name: client.last_name,
    address: client.address,
    phone: client.phone,
    email: client.email,
    dni: client.dni,
    coords: {
      lat: client.coords.lat,
      lng: client.coords.lng
    },
  }
  center.value = { lat: client.coords.lat, lng: client.coords.lng };
  showClientMenu.value = false;
  markerOptions.value = { position: center.value, label: 'L', title: 'LADY LIBERTY' };
}

// hook
onBeforeMount(() => {
  if (props.orderSelected && props.orderSelected._id) {
    order.value = JSON.parse(JSON.stringify(props.orderSelected));
  }
  const promiseArray = [];
  if (!configuration.value.route_price_by_km) {
    promiseArray.push(cityContent.doListCities('page=1&perPage=100'));
  }

  Promise.all(promiseArray);
});

onBeforeUnmount(() => {
  storeSender.clearSenders();
  storeClient.clearClients();
});
</script>

<style scoped lang="scss"></style>
