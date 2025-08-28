<template>
  <q-form @submit="handlerSaveOrder">
    <q-tabs v-model="tab" no-caps dense class="text-primary full-width q-pa-none">
      <q-tab name="general" :label="t('general')" />
      <q-tab name="sender" :label="t('sender').substring(0, 9)" />
      <q-tab name="client" :label="t('client').substring(0, 7)" />
      <q-tab name="products" :label="t('products')" />
      <q-tab name="summary" :label="t('resume')"
        v-if="order.sender.brand_name && order.client.name && order.sender.address.address && order.order_price" />
    </q-tabs>

    <q-tab-panels class="full-width" v-model="tab" animated swipeable vertical transition-prev="jump-up"
      transition-next="jump-up">
      <!--General-->
      <q-tab-panel name="general">
        <div class="row">
          <div class="col-12 col-md-6" :class="{ 'q-pr-sm': $q.screen.gt.sm }" v-if="!configuration.route_price_by_km">
            <label for="city">{{ t('city') }}</label>
            <q-select @update:model-value="getZones" :label="t('selectOneOptions')" outlined dense
              :rules="[(val) => !!val || t('requiredField')]" id="city" :options="cities" v-model="city"></q-select>
          </div>

          <div class="col-12 col-md-6" :class="{ 'q-pl-sm': $q.screen.gt.sm }" v-if="!configuration.route_price_by_km">
            <label for="city">{{ t('zones').substring(0, 4) }}</label>
            <q-select @update:model-value="setZone" :label="t('selectOneOptions')" outlined dense
              :rules="[(val) => !!val || t('requiredField')]" id="city" :options="zones" v-model="zone"></q-select>
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
                  <q-radio @update:model-value="setSenderAddress" v-model="selectedAddress" :val="address.address"
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
            <q-btn @click="openModalAdd('address')" no-caps :label="t('otherAddress')" unelevated color="primary"
              rounded></q-btn>
          </div>
          <div class="col-12 q-mt-md text-center" v-if="order.sender.brand_name">
            <q-btn no-caps @click="clearSenderAddress" outline :label="t('otherSender')" color="primary"
              rounded></q-btn>
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
            <q-input readonly id="name" :rules="[(val) => !!val || t('requiredField')]" outlined dense
              v-model="order.client.name" />
          </div>

          <div class="col-12 col-md-6" v-if="order.client.name" :class="{ 'q-pl-sm': $q.screen.gt.sm }">
            <label for="lastName">{{ t('lastName') }}</label>
            <q-input readonly id="lastName" :rules="[(val) => !!val || t('requiredField')]" outlined dense
              v-model="order.client.last_name" />
          </div>

          <div class="col-12" v-if="order.client.name">
            <label for="address">{{ t('address') }}</label>
            <q-input readonly id="address" :rules="[(val) => !!val || t('requiredField')]" outlined dense
              v-model="order.client.address" />
          </div>

          <div class="col-12 col-md-6" v-if="order.client.name" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
            <label for="phone">{{ t('phone') }}</label>
            <q-input readonly id="phone" :rules="[(val) => !!val || t('requiredField')]" outlined dense
              v-model="order.client.phone" />
          </div>

          <div class="col-12 col-md-6" v-if="order.client.name" :class="{ 'q-pl-sm': $q.screen.gt.sm }">
            <label for="email">{{ t('email') }}</label>
            <q-input readonly id="email" :rules="[(val) => !!val || t('requiredField')]" outlined dense
              v-model="order.client.email" />
          </div>

          <div class="col-12" v-if="order.client.name">
            <label for="dni">{{ t('dni') }}</label>
            <q-input readonly id="dni" :rules="[(val) => !!val || t('requiredField')]" outlined dense
              v-model="order.client.dni" />
          </div>

          <div class="col-12 q-mt-lg relative" v-if="order.client.name">
            <GoogleMap :api-key="configuration.gmap_api__key" style="width: 100%; height: 220px" :center="center"
              :zoom="17">
              <Marker :options="markerOptions" />
            </GoogleMap>
            <div class="div absolute-top full-width full-height"></div>
          </div>

          <div class="col-12 text-center q-mt-lg" v-if="order.client.name">
            <q-btn rounded color="primary" @click="resetClient" :label="t('otherClient')" no-caps unelevated></q-btn>
          </div>
        </div>
      </q-tab-panel>
      <!--End client-->

      <!--Products-->
      <q-tab-panel name="products">
        <div class="row" v-for="(product, idx) in order.products" :key="idx">
          <div class="col-12">
            <label for="productName">{{ t('name') }}</label>
            <q-input id="productName" :rules="[(val) => !!val || t('requiredField')]"
              :placeholder="t('productNamePlaceholder')" outlined dense v-model="product.name" />
          </div>
          <div class="col-12 col-md-4" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
            <label for="quantity">{{ t('quantity') }}</label>
            <q-input id="quantity" type="number" :rules="[(val) => !!val || t('requiredField')]" placeholder="1"
              outlined dense v-model="product.quantity" />
          </div>
          <div class="col-12 col-md-4" :class="{ 'q-px-sm': $q.screen.gt.sm }">
            <label for="unitPrice">{{ t('unitPrice') }}</label>
            <q-input v-money="money" id="unitPrice" :rules="[(val) => !!val || t('requiredField')]"
              placeholder="5.000,00" outlined dense v-model="product.unit_price" />
          </div>
          <div class="col-12 col-md-4" :class="{ 'q-pl-sm': $q.screen.gt.sm }">
            <label for="weight">{{ t('weight') }} (Kg)</label>
            <q-input type="number" id="weight" :rules="[(val) => !!val || t('requiredField')]" placeholder="1.00"
              outlined dense v-model="product.weight" />
          </div>
          <div class="col-12">
            <label for="description">{{ t('description') }}</label>
            <q-input rows="3" type="textarea" id="description" :placeholder="t('description')" outlined dense
              v-model="product.description" />
          </div>
          <div class="col-12 q-mb-md q-mt-lg" v-if="order.products.length > 1 && idx !== order.products.length - 1">
            <q-separator></q-separator>
          </div>
        </div>
        <div class="row q-mt-lg">
          <div class="col-12 text-center">
            <q-btn @click="addNewProduct" rounded color="primary" unelevated :label="t('add')"></q-btn>
          </div>
        </div>
      </q-tab-panel>
      <!--End products-->

      <!--Summary-->
      <q-tab-panel name="summary"
        v-if="order.sender.brand_name && order.client.name && order.sender.address.address && order.order_price">
        <div class="row">
          <q-list class="summary-list">
            <!--Sender item-->
            <q-item dense>
              <q-item-section>
                <q-item-label class="title text-primary q-mb-sm">{{ t('sender').substring(0, 9) }}:</q-item-label>
                <q-item-label caption lines="1">
                  <span>
                    <q-icon color="primary" name="store" class="q-mr-sm" />
                    {{ order.sender.brand_name }}
                  </span>
                </q-item-label>
                <q-item-label caption lines="2">
                  <span>
                    <q-icon color="primary" name="location_on" class="q-mr-sm" />
                    {{ order.sender.address.address }}
                  </span>
                </q-item-label>
                <q-item-label caption lines="1">
                  <span>
                    <q-icon color="primary" name="phone" class="q-mr-sm" />
                    {{ order.sender.brand_phone }}
                  </span>
                </q-item-label>
              </q-item-section>
            </q-item>
            <!--End sender item-->

            <!--item cliente-->
            <q-item dense class="q-mt-sm">
              <q-item-section>
                <q-item-label class="title text-primary q-mb-sm">{{ t('client').substring(0, 7) }}:</q-item-label>
                <q-item-label caption lines="1">
                  <span>
                    <q-icon color="primary" name="person" class="q-mr-sm" />
                    {{ order.client.name }} {{ order.client.last_name }}
                  </span>
                </q-item-label>
                <q-item-label caption lines="2">
                  <span>
                    <q-icon color="primary" name="location_on" class="q-mr-sm" />
                    {{ order.client.address }}
                  </span>
                </q-item-label>
                <q-item-label caption lines="1">
                  <span>
                    <q-icon color="primary" name="phone" class="q-mr-sm" />
                    {{ order.client.phone }}
                  </span>
                </q-item-label>
              </q-item-section>
            </q-item>
            <!--End item client-->

            <!--item products-->
            <q-item dense class="q-mt-sm">
              <q-item-section>
                <q-item-label class="title text-primary q-mb-sm">{{ t('content') }}:</q-item-label>
                <q-item-label caption lines="3">
                  <span>
                    {{ productsSummary }}.
                  </span>
                </q-item-label>
              </q-item-section>
            </q-item>
            <!--End item products-->

            <!--item city and zone-->
            <q-item dense class="q-mt-sm" v-if="order.city && order.zone">
              <q-item-section>
                <q-item-label class="title text-primary q-mb-sm">{{ t('city') }}:</q-item-label>
                <q-item-label caption lines="3">
                  <span>
                    {{ order.city }}, {{ order.zone.name }}
                  </span>
                </q-item-label>
              </q-item-section>
            </q-item>
            <!--End item city and zone-->

            <!--item complemento-->
            <q-item dense class="q-mt-sm">
              <q-item-section>
                <q-item-label class="title text-primary q-mb-sm">{{ t('general') }}:</q-item-label>
                <q-item-label caption lines="1">
                  <span>
                    <q-icon color="primary" name="calendar_today" class="q-mr-sm" />
                    {{ order.scheduled_date }}
                  </span>
                </q-item-label>
                <q-item-label caption lines="1">
                  <span>
                    <q-icon color="primary" name="account_balance_wallet" class="q-mr-sm" />
                    {{ order.cash_on_delivery ? t('yes') : t('no') }}
                  </span>
                </q-item-label>
                <q-item-label caption lines="1">
                  <span>
                    <q-icon color="primary" name="payments" class="q-mr-sm" />
                    {{ utils.formatPrice(parseFloat(order.cash_amount.replace('.', ''))) }}
                  </span>
                </q-item-label>
              </q-item-section>
            </q-item>
            <!--End item client-->

            <!--item print guide-->
            <q-item dense class="q-mt-sm">
              <q-item-section>
                <q-item-label class="title text-primary q-mb-sm">{{ t('printGuide') }}:</q-item-label>
                <q-item-label caption>
                  <q-checkbox style="margin-left: -10px" v-model="printGuide"
                    :label="printGuide ? t('yes') : t('no')"></q-checkbox>
                </q-item-label>
              </q-item-section>
            </q-item>
            <!--End item city and zone-->

            <!--price order-->
            <div class="price-order">
              {{ utils.formatPrice(order.order_price) || utils.formatPrice(0) }}
            </div>
            <!--end price order-->
          </q-list>
        </div>
      </q-tab-panel>
      <!--End summary-->
    </q-tab-panels>

    <div class="col-12 q-px-md d-flex content-between">
      <div class="div back-div">
        <q-btn unelevated outline @click="backTab" size="md" no-caps rounded v-if="tab !== 'general'" :label="t('back')"
          color="primary"></q-btn>
      </div>
      <q-btn v-if="tab === 'summary'"
        :disable="!order.sender.brand_name || !order.client.name || !order.sender.address.address || !order.order_price"
        :loading="loading" unelevated size="md" type="submit" no-caps rounded :label="t('save')"
        color="primary"></q-btn>
      <q-btn v-else unelevated @click="nextTab" size="md" no-caps rounded :label="t('next')" color="primary"></q-btn>
    </div>

    <q-dialog position="right" v-model="formAdd">
      <ModalCard
        :title="formEnable === 'sender' ? t('sendersCreate') : formEnable === 'address' ? t('address') : t('clientCreate')">
        <template #body>
          <SendersForm v-if="formEnable === 'sender'" :sender-selected="senderSelected" @close-modal="closeModalAdd" />
          <AddressForm :senderSelected="senderSelected" v-if="formEnable === 'address'" @close-modal="closeModalAdd" />
          <ClientsForm v-if="formEnable === 'client'" @close-modal="closeModalAdd" />
        </template>
      </ModalCard>
    </q-dialog>
  </q-form>
</template>

<script setup>
// imports
import { VMoney } from 'v-money';
import { useI18n } from 'vue-i18n';
import { date, Loading } from 'quasar';
import { Utils } from 'src/utils/utils';
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
import { shippingContent } from 'src/composables/shippingContent';
import ClientsForm from '../../clients/components/ClientsForm.vue';
import { ref, onBeforeMount, computed, onBeforeUnmount } from 'vue';
import SendersForm from 'src/components/dashboard/senders/components/SendersForm.vue';
import { useOrdersStore } from 'src/stores/ordersStore';

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
      quantity: 1,
      unit_price: null,
      total_price: null,
      weight: 1.00
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
  // courier: {
  //   full_name: "",
  //   vehicle_type: "",
  //   license_plate: ""
  // },
  cash_on_delivery: false,
  cash_amount: '0',
  settled_to_sender: false,
  notes: "",
  order_price: 0,
});
const city = ref('');
const zone = ref('');
const zones = ref([]);
const quote = ref({});
const { t } = useI18n();
const utils = new Utils();
const formAdd = ref(false);
const formEnable = ref('');
const loading = ref(false);
const tab = ref('general');
const dateReference = ref();
const senderSearch = ref('');
const clientSearch = ref('');
const printGuide = ref(false);
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
const ordersStore = useOrdersStore();
const citiesStore = useCitiesStore();
const storeSender = useSendersStore();
const storeClient = useClientsStore();
const senderContent = sendersContent();
const clientContent = clientsContent();
const center = ref({ lat: 0, lng: 0 });
const shippingContents = shippingContent();
const tabsOrder = ['general', 'sender', 'client', 'products', 'summary'];
const markerOptions = ref({ position: center, label: 'L', title: 'LADY LIBERTY' });

// emits
const emit = defineEmits(['close-modal', 'up-total-item']);

//computed
const productsSummary = computed(() => {
  const products = [];
  order.value.products.map((product) => {
    products.push(product.name);
  });
  return products.join(', ');
});
const senders = computed(() => storeSender.getSenders);
const clients = computed(() => storeClient.getClients);
const cities = computed(() => citiesStore.getCities.map(city => {
  return { label: city.name, value: city.name, zones: city.zones }
}));
const configuration = computed(() => authStore.getUser.brand.configuration || {});

// methods
const handlerDoQuote = async () => {
  if (configuration.value && configuration.value?.route_price_by_km && !quote.value?.sender) return;
  if (configuration.value && configuration.value?.route_price_by_km && !quote.value?.client) return;

  Loading.show();
  try {
    const data = await shippingContents.doQuoteShipping(quote.value);
    if (data) {
      order.value.order_price = data.shipping_price;
    }
  } finally {
    Loading.hide();
  }
}

const handlerDoQuoteByCity = async () => {
  if (configuration.value && !configuration.value?.route_price_by_km && !quote.value.city || !quote.value.city.zone) return;
  Loading.show();
  try {
    const data = await shippingContents.doQuoteShipping(quote.value);
    if (data) {
      order.value.order_price = parseFloat(data.shipping_price.replace('.', ''));
    }
  } finally {
    Loading.hide();
  }
}

const handlerSaveOrder = async () => {
  const timeStamp = Date.now()
  const formattedString = date.formatDate(timeStamp, 'YYYY-MM-DDTHH:mm:ss.SSSZ')

  if (!order.value._id) order.value.date = formattedString;
  order.value.client.dni = order.value.client.dni.toString();
  delete order.value.sender.optionsAddress;

  order.value.products = order.value.products.map((el) => {
    el.total_price = `${parseFloat(el.unit_price.replace('.', '')) * el.quantity}`;
    return el;
  });

  order.value.print_guide = printGuide.value;

  if (order.value?._id) {
    await handlerUpdateOrder();
    return;
  }

  loading.value = true;
  try {
    const response = await content.doCreateOrder(order.value);
    if (response && response.success) {
      if (response.data?.print_guide) {
        response.data.status = response.data?.print_guide === true ? 'guide-printed' : 'pending';
        ordersStore.updateOrder(response.data)
      };
      notification('success', t('orderCreated'), 'primary');
      emit('close-modal');
      emit('up-total-item');
    }
  } finally {
    loading.value = false;
  }
}

const handlerUpdateOrder = async () => {
  order.value.products = order.value.products.map((el) => {
    el.quantity = Number(el.quantity);
    el.weight = Number(el.weight);
    return el;
  })

  loading.value = true;
  try {
    const response = await content.doUpdateOrder(order.value);
    if (response && response.success) {
      notification('success', t('orderUpdated'), 'primary');
      emit('close-modal');
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

const setSenderAddress = async (address) => {
  order.value.sender.brand_name = senderSelected.value?.sender_info?.brand_name;
  order.value.sender.brand_phone = senderSelected.value?.sender_info?.brand_phone;
  address = order.value.sender.optionsAddress.find(a => a.address === address);
  order.value.sender.address = {
    address: address?.address,
    complement: address?.complement,
    coords: {
      "lat": address?.coords?.lat,
      "lng": address?.coords?.lng
    }
  }

  // set quote for quote shipping
  if (configuration.value?.route_price_by_km) {
    quote.value.sender = {
      coords: {
        lat: address?.coords?.lat,
        lng: address?.coords?.lng
      }

    }
    await handlerDoQuote();
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

const getZones = async (e) => {
  order.value.city = e.label;
  zones.value = e.zones.map((z) => {
    return {
      label: z.name,
      value: z.name,
      price: z.price,
      cod_zone: z.cod_zone
    }
  });

  quote.value.city = {
    name: e.label,
    zone: null,
  }
  if (zone.value) zone.value = null;
  await handlerDoQuoteByCity();
}

const setZone = async (e) => {
  order.value.zone = {
    name: e.label,
    price: e.price,
    cod_zone: e.cod_zone
  }

  quote.value.city.zone = {
    name: e.label,
    price: e.price,
  }

  await handlerDoQuoteByCity();
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
    senderSelected.value = e;
    order.value.sender.optionsAddress = e?.sender_info?.address;
  }

  if (formEnable.value === 'client') {
    setClient(e?.data);
    center.value = { lat: e?.data.coords.lat, lng: e?.data.coords.lng };
    markerOptions.value.position = center.value;
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

const setClient = async (client) => {
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

  // set quote for quote shipping
  if (configuration.value?.route_price_by_km) {
    quote.value.client = {
      coords: {
        lat: client.coords.lat,
        lng: client.coords.lng
      }
    }
    await handlerDoQuote();
  }
}

const addNewProduct = () => {
  order.value.products.push({
    name: '',
    description: "",
    quantity: 1,
    unit_price: null,
    total_price: null,
    weight: 1
  });
}

const resetClient = () => {
  order.value.client = {
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
  }
  storeClient.clearClients();
  clientSearch.value = '';
  showClientMenu.value = false;
}

// hook
onBeforeMount(async () => {
  if (props.orderSelected && props.orderSelected._id) {
    order.value = JSON.parse(JSON.stringify(props.orderSelected));


    const promiseArray = [];
    if (!configuration.value.route_price_by_km) {
      promiseArray.push(cityContent.doListCities('page=1&perPage=100'));
    }

    Promise.all(promiseArray);

    // validamos el remitente
    if (order.value.sender && order.value.sender.brand_name) {
      await loadSenders(order.value.sender.brand_name);
      if (senders.value.length > 0) {
        const sender = senders.value.find(s => s.sender_info.brand_name === order.value.sender.brand_name);
        senderSelected.value = sender;
        order.value.sender.optionsAddress = sender?.sender_info?.address;
        selectedAddress.value = order.value.sender?.address?.address;
        storeSender.clearSenders();
      }
    }

    // validamos el cliente
    if (order.value.client && order.value.client.name) {
      setClient(order.value.client);
      center.value = { lat: order.value.client.coords.lat, lng: order.value.client.coords.lng };
      markerOptions.value.position = center.value;
    }

    if (!configuration.value?.route_price_by_km && order.value && order.value.city) {
      city.value = order.value.city;
      const citySelected = cities.value.find(c => c.label === order.value.city);
      await getZones(citySelected);
      zone.value = order.value.zone.name;
    }
  }
});

onBeforeUnmount(() => {
  storeSender.clearSenders();
  storeClient.clearClients();
});
</script>

<style scoped lang="scss">
.summary-list {
  font-size: 1rem;
  width: 100%;

  .title {
    font-weight: 600;
  }

  .q-item__label--caption {
    font-size: .8rem;
  }

  span {
    display: inline-flex;
    justify-content: center;
    align-content: center;
  }
}

.price-order {
  display: flex;
  background: $primary;
  max-width: 160px;
  padding: .3rem .5rem;
  justify-content: center;
  color: white;
  font-weight: 600;
  border-radius: 4px;
  position: absolute;
  right: 20px;
  bottom: 50px
}
</style>
