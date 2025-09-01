<template>
  <div class="row guide-wrapper" v-if="order._id">
    <!--Header-->
    <div class="col-12 col-md-6">
      <h4 class="title">
        {{ t('orderShowTitle').replace('-reference', order?.reference) }}
      </h4>
    </div>
    <div class="col-12 col-md-6">
      <div class="order-action">
        <!--Status action-->
        <q-select v-if="utils.validateRole('update-order') && order?.status !== 'delivered'"
          @update:model-value="toggleStatus" class="order-action__item" outlined map-options rounded dense
          v-model="order.status" :options="statusOption"></q-select>
        <!--End status action-->

        <!--Show guide action-->
        <q-btn v-if="order?.print_guide && utils.validateRole('list-order')" class="order-action__item"
          @click="showGuide(order?.reference)" color="green-6" unelevated rounded :label="t('guide')" no-caps
          icon-right="document_scanner"></q-btn>
        <!--En Show guide action-->

        <!--Contact action-->
        <q-btn class="order-action__item" @click="openWhatSapp(order?.client?.phone?.replace(/\D/g, ''))"
          color="primary" unelevated rounded :label="t('contact')" no-caps icon-right="phone"></q-btn>
        <!--En contact action-->
      </div>
    </div>
    <!--End header-->

    <!--section-->
    <div class="col-12 q-mt-lg">
      <section class="full-width row">
        <!--General information data-->
        <div class="col-12 col-md-5" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
          <!--General data-->
          <article class="show-order-article">
            <header>
              <h5 class="text-primary">
                {{ t('general') }}
              </h5>
            </header>

            <section class="row">
              <div class="col-12 col-md-6">
                <h6>
                  {{ t('createdAt') }}
                </h6>
                <span>{{ formatDate }}</span>
              </div>
              <div class="col-12 col-md-6">
                <h6>
                  {{ t('scheduled_date') }}
                </h6>
                <span>{{ date.formatDate(order?.scheduled_date, 'DD/MM/YYYY') }}</span>
              </div>
              <div class="col-12 col-md-6">
                <h6>
                  {{ t('cashOnDelivery') }}
                </h6>
                <span>{{ order?.cash_on_delivery ? t('yes') : t('no') }}</span>
              </div>
              <div class="col-12 col-md-6">
                <h6>
                  {{ t('cashAmount') }}
                </h6>
                <span>{{ utils.formatPrice(parseFloat(order?.cash_amount.replace('.', '')) || 0) }}</span>
              </div>
              <div class="col-12 col-md-6">
                <h6>
                  {{ t('price') }}
                </h6>
                <span>{{ utils.formatPrice(order?.order_price || 0) }}</span>
              </div>
              <div class="col-12 col-md-6" v-if="order?.discount > 0">
                <h6>
                  {{ t('discount') }}
                </h6>
                <span class="text-red">- {{ utils.formatPrice(order.discount || 0) }}</span>
              </div>
              <div class="col-12">
                <h6>
                  {{ t('notes') }}
                </h6>
                <span>{{ order?.notes }}</span>
              </div>
            </section>
          </article>
          <!--End general data-->

          <!--Sender data-->
          <article class="show-order-article q-mt-lg">
            <header>
              <h5 class="text-primary">
                {{ t('sender').substring(0, 9) }}
              </h5>
            </header>

            <section class="row">
              <div class="col-12 col-md-6">
                <h6>
                  {{ t('name') }}
                </h6>
                <span>{{ order?.sender.brand_name }}</span>
              </div>
              <div class="col-12 col-md-6">
                <h6>
                  {{ t('phone') }}
                </h6>
                <span class="text-primary cursor-pointer">
                  {{ order?.sender?.brand_phone }}
                  <q-btn size="sm" @click="openWhatSapp(order?.sender?.brand_phone?.replace(/\D/g, ''))" flat dense
                    rounded icon="img:/images/whatsapp.png" />
                </span>
              </div>
              <div class="col-12">
                <h6>
                  {{ t('address') }}
                </h6>
                <span>
                  {{ order?.sender?.address?.address }},
                  {{ order?.sender?.address?.complement }}
                </span>
              </div>
              <div class="col-12">
                <h6>
                  {{ t('map') }}
                </h6>
                <GoogleMap :api-key="user.brand.configuration.gmap_api__key" style="width: 100%; height: 220px"
                  :center="{ lat: order?.sender?.address.coords?.lat, lng: order?.sender?.address.coords?.lng }"
                  :zoom="17">
                  <Marker
                    :options="{ position: { lat: order?.sender?.address.coords?.lat, lng: order?.sender?.address.coords?.lng }, label: 'L', title: 'LADY LIBERTY' }" />
                </GoogleMap>
              </div>
            </section>
          </article>
          <!--End sender data-->

          <!--Client data-->
          <article class="show-order-article q-mt-lg">
            <header>
              <h5 class="text-primary">
                {{ t('client').substring(0, 7) }}
              </h5>
            </header>

            <section class="row">
              <div class="col-12 col-md-6">
                <h6>
                  {{ t('name') }}
                </h6>
                <span>{{ order?.client?.name }} {{ order?.client?.last_name }}</span>
              </div>
              <div class="col-12 col-md-6">
                <h6>
                  {{ t('phone') }}
                </h6>
                <span class="text-primary cursor-pointer">
                  <a :href="`tel:${order?.client?.phone}`">{{ order?.client?.phone }}</a>
                  <q-btn size="sm" @click="openWhatSapp(order?.client?.phone?.replace(/\D/g, ''))" flat dense rounded
                    icon="img:/images/whatsapp.png" />
                </span>
              </div>
              <div class="col-12 col-md-6">
                <h6>
                  {{ t('email') }}
                </h6>
                <span>
                  <a :href="`mailto:${order?.client?.email}`">{{ order?.client?.email }}</a>
                </span>
              </div>
              <div class="col-12 col-md-6">
                <h6>
                  {{ t('dni') }}
                </h6>
                <span>
                  {{ order?.client?.dni }}
                </span>
              </div>
              <div class="col-12">
                <h6>
                  {{ t('address') }}
                </h6>
                <span>
                  {{ order?.client?.address }}
                </span>
              </div>
              <div class="col-12">
                <h6>
                  {{ t('map') }}
                </h6>
                <GoogleMap :api-key="user.brand.configuration.gmap_api__key" style="width: 100%; height: 220px"
                  :center="{ lat: order?.client?.coords?.lat, lng: order?.client?.coords?.lng }" :zoom="17">
                  <Marker
                    :options="{ position: { lat: order?.client?.coords?.lat, lng: order?.client?.coords?.lng }, label: 'L', title: 'LADY LIBERTY' }" />
                </GoogleMap>
              </div>
            </section>
          </article>
          <!--End Client data-->
        </div>
        <!--End general information data-->

        <!--complement section-->
        <div class="col-12 col-md-7" :class="{ 'q-pl-sm': $q.screen.gt.sm, 'q-mt-lg': $q.screen.lt.md }">
          <!--tabs-->
          <article class="show-order-article">
            <!--tabs header-->
            <header>
              <q-tabs v-model="tab" no-caps class="text-primary full-width">
                <q-tab style="width: 100%" name="products" :label="t('products')" />
                <q-tab v-if="order?.cash_on_delivery" style="width: 100%" name="collection" :label="t('collection')" />
                <q-tab style="width: 100%" name="news" :label="t('guide_news')" />
              </q-tabs>
            </header>
            <!--End tabs header-->

            <!--tabs content-->
            <section>
              <q-tab-panels v-model="tab" animated swipeable vertical transition-prev="jump-up"
                transition-next="jump-up">
                <!--panel for product-->
                <q-tab-panel class="q-pa-none q-px-md" name="products">
                  <q-markup-table flat>
                    <thead>
                      <tr>
                        <th class="text-left">
                          {{ t('name') }}
                        </th>
                        <th class="text-center">
                          {{ t('quantity') }}
                        </th>
                        <th class="text-center">
                          {{ t('weight') }}(Kg)
                        </th>
                        <th class="text-right">
                          {{ t('unitPrice') }}
                        </th>
                        <th class="text-right">
                          {{ t('price') }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(product, idx) in order?.products" :key="idx">
                        <td class="text-left">
                          {{ product?.name }}
                        </td>
                        <td class="text-center">
                          {{ product?.quantity }}.00
                        </td>
                        <td class="text-center">
                          {{ product?.weight }}
                        </td>
                        <td class="text-right">
                          {{ utils.formatPrice(parseFloat(product?.unit_price.replace('.', '')) || 0) }}
                        </td>
                        <td class="text-right">
                          {{ product?.total_price > 0 ?
                            utils.formatPrice(parseFloat(parseFloat(product?.unit_price.replace('.', '')) *
                              product?.quantity)) : utils.formatPrice(0) }}
                        </td>
                      </tr>
                    </tbody>
                  </q-markup-table>
                </q-tab-panel>
                <!--End panel for product-->

                <!--panel for collection-->
                <q-tab-panel class="q-pa-none q-px-md" name="collection">
                  <section class="order-collection">
                    <span v-if="order.payments.length === 0">
                      {{ t('noPayments') }}
                    </span>

                    <div class="row full-width">
                      <div class="col-12 col-md-6 text-center">
                        <p class="text-bold text-primary">{{ t('cashAmount') }}</p>
                        {{ utils.formatPrice(parseFloat(order.cash_amount.replace('.', '')) || 0) }}
                      </div>

                      <div class="col-12 col-md-6 text-center">
                        <p class="text-bold text-primary">{{ t('cashAmountPending') }}</p>
                        {{ utils.formatPrice(restToCollection) }}
                      </div>
                    </div>

                    <q-list class="full-width">
                      <q-item v-for="(payment, idx) in order.payments" :key="idx">
                        <q-item-section>
                          <q-item-label class="text-bold text-primary">
                            {{ payment.methods }}
                          </q-item-label>
                          <q-item-label caption lines="1">
                            {{ utils.formatPrice(parseFloat(payment.amount.replace('.', '')) || 0) }}
                          </q-item-label>
                        </q-item-section>

                        <q-item-section side top v-if="payment?.file">
                          <q-btn @click="openEvidence(payment?.file)" icon="image" flat dense rounded
                            color="primary"></q-btn>
                        </q-item-section>
                      </q-item>
                    </q-list>
                    <q-btn v-if="utils.validateRole('update-order') && restToCollection !== 0 && user.type_user !== 'sender'" @click="openModalPayment"
                      rounded color="primary" :label="t('add')" unelevated no-caps></q-btn>
                  </section>
                </q-tab-panel>
                <!--End panel for collection-->

                <!--panel for news-->
                <q-tab-panel class="q-pa-none q-px-md" name="news">
                  <q-timeline color="primary" v-if="order.news.length > 0">
                    <q-timeline-entry class="text-primary" v-for="(news, idx) in order.news" :key="idx"
                      :title="news.type_news" :subtitle="date.formatDate(news.date, 'DD/MM/YYYY HH:mm')">
                      <div v-if="news?.description" style="margin-top: -10px" class="text-black">
                        <p>
                          {{ news.description || '' }}
                        </p>
                        <p v-if="news?.resolve_answer">
                          <span class="text-bold">{{ t('resolve') }}</span>: {{ news?.resolve_answer }}
                        </p>
                      </div>
                    </q-timeline-entry>
                  </q-timeline>
                  <section v-else class="text-center">
                    <span>
                      {{ t('noNews') }}
                    </span>
                  </section>
                </q-tab-panel>
                <!--end panel for news-->
              </q-tab-panels>
            </section>
            <!--End tabs content-->
          </article>
          <!--End tabs-->

          <!--status-->
          <article class="show-order-article q-mt-lg">
            <header>
              <h5 class="text-primary">
                {{ t('statuses') }}
              </h5>
            </header>

            <section class="row">
              <div class="col-12">
                <q-scroll-area style="width: 100%; height: 630px">
                  <q-timeline color="primary" style="margin-left: 8px">
                    <q-timeline-entry class="text-primary" v-for="(state, idx) in order.statuses" :key="idx"
                      :title="status[state.status] || state.status" :icon="state.status === 'delivered' ? 'done' : 'local_shipping'"
                      :subtitle="date.formatDate(state.date, 'DD/MM/YYYY HH:mm')">
                      <div v-if="state?.description">
                        {{ state.description || '' }}
                      </div>
                    </q-timeline-entry>
                  </q-timeline>
                </q-scroll-area>
              </div>
            </section>
          </article>
          <!--end status-->

          <!--Courier-->
          <article class="show-order-article q-mt-lg">
            <header>
              <h5 class="text-primary">
                {{ t('delivery').substring(0, 10) }}
              </h5>
            </header>

            <section class="row">
              <div class="col-12 col-md-6">
                <h6>
                  {{ t('name') }}
                </h6>
                <span>{{ order?.courier?.full_name || '-' }}</span>
              </div>
              <div class="col-12 col-md-6">
                <h6>
                  {{ t('typeVehicle') }}
                </h6>
                <span class="text-primary cursor-pointer">
                  <span>{{ order?.courier?.vehicle_type || '-' }}</span>
                </span>
              </div>
              <div class="col-12 col-md-6">
                <h6>
                  {{ t('licensePlate') }}
                </h6>
                <span>{{ order?.courier?.license_plate || '-' }}</span>
              </div>
              <div class="col-12 col-md-6">
                <h6>
                  {{ t('phone') }}
                </h6>
                <span class="text-primary cursor-pointer" v-if="order?.courier">
                  <a :href="`tel:${order?.client?.phone}`">{{ order?.courier?.phone }}</a>
                  <q-btn size="sm" @click="openWhatSapp(order?.courier?.phone?.replace(/\D/g, ''))" flat dense rounded
                    icon="img:/images/whatsapp.png" />
                </span>
                <span v-else>-</span>
              </div>
            </section>
          </article>
          <!--End courier-->
        </div>
        <!--End complement-->
      </section>
    </div>
    <!--End section-->

    <!--collection dialog-->
    <q-dialog v-model="openModalCollection">
      <ModalCard :title="t('createCollection')">
        <template #body>
          <OrderPaymentForm :order-id="order._id" :rest-to-collection="restToCollection"
            @close-modal="openModalPayment" />
        </template>
      </ModalCard>
    </q-dialog>
    <!--End collection dialog-->
  </div>
</template>

<script setup>
// imports
import { date } from 'quasar';
import { Loading } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { Utils } from 'src/utils/utils';
import { computed, onBeforeMount, ref } from 'vue';
import { GoogleMap, Marker } from 'vue3-google-map';
import { useAuthStore } from 'src/stores/authStore';
import { notification } from 'src/boot/notification';
import { useOrdersStore } from 'src/stores/ordersStore';
import ModalCard from 'src/components/partials/ModalCard.vue';
import { ordersContent } from 'src/composables/ordersContent';
import { guidesContent } from 'src/composables/guidesContent';
import OrderPaymentForm from './components/OrderPaymentForm.vue';

// references
const tab = ref('products');
const { t } = useI18n();
const route = useRoute();
const utils = new Utils();
const store = useOrdersStore();
const authStore = useAuthStore();
const contentOrder = ordersContent();
const contentGuides = guidesContent();
const openModalCollection = ref(false);


const status = {
  pending: t('pending'),
  in_progress: t('in_progress'),
  delivered: t('delivered'),
  cancelled: t('cancelled'),
  returned: t('returned'),
  'guide-printed': t('guide_printed'),
  guide_news: t('guide_news'),
}

// computed
const order = computed(() => {
  return store.getOrder;
});

const brand = computed(() => {
  return authStore.user?.brand || {};
});

const user = computed(() => {
  return authStore.getUser;
});

const restToCollection = computed(() => {
  let totalPayment = 0;
  for (const payment of order.value.payments) {
    let amount = payment?.amount.replace('.', '');
    amount = parseFloat(amount);
    totalPayment += amount;
  }
  const cashAmount = parseFloat(order.value?.cash_amount.replace('.', ''));
  return cashAmount - totalPayment;
});

const configuration = computed(() => authStore.getConfiguration);

const formatDate = computed(() => date.formatDate(order.value?.date, 'DD/MM/YYYY'));

const statusOption = computed(() => {
  const statuses = [
    {
      label: status.pending,
      value: 'pending',
    },
    {
      label: status.in_progress,
      value: 'in_progress',
    },
    {
      label: status.delivered,
      value: 'delivered',
    },
    {
      label: status.cancelled,
      value: 'cancelled',
    },
    {
      label: status.returned,
      value: 'returned',
    },
    {
      label: status['guide-printed'],
      value: 'guide-printed',
    },
    {
      label: status.guide_news,
      value: 'guide_news',
    }
  ];

  if (configuration.value?.statuses) {
    const complementStatuses = configuration.value?.statuses?.split('\n');

    for (const status of complementStatuses) {
      statuses.push({
        label: status,
        value: status,
      });
    }
  }

  return statuses;
});

// methods
const openWhatSapp = (phone) => {
  window.open(`https://wa.me/${phone}?text=${t('whastappText').replace('-business', brand.value.name)}`, '_blank');
}

const showGuide = async (reference) => {
  Loading.show();
  try {
    const data = await contentGuides.doGetGuide(`reference=${reference}`);
    if (data?.success) {
      utils.donloadLink(data?.data?.guide_url);
    }
  } finally {
    Loading.hide();
  }
}

const toggleStatus = async (status) => {
  const createOrderDto = {
    status: status.value,
    order_reference: order.value?.reference,
    guide_url: '',
  }

  try {
    Loading.show();
    const data = await contentOrder.doUpdateOrderStatus(createOrderDto);
    if (data.success) {
      notification('success', t('statusChangedSuccess'), 'primary')
    }
  } finally {
    Loading.hide();
  }
}

const openModalPayment = () => {
  openModalCollection.value = !openModalCollection.value;
}

const openEvidence = (url) => {
  window.open(url, '_blank');
}

// hook
onBeforeMount(() => {
  if (route.params.id) {
    contentOrder.doShowOrder(route.params.id);
  }
})
</script>

<style scoped lang="scss">
.title {
  font-size: 1.5rem;
  font-weight: 600;
}

.order-action {
  width: 100%;
  display: flex;
  gap: 1rem;
  justify-items: flex-end;
  justify-content: flex-end;

  &__item {
    flex: 1;
  }

  // mediaqueries
  @media(width < 768px) {
    flex-direction: column;
  }
}

.show-order-article {
  display: flex;
  border-radius: 6px;
  padding: .5rem 1rem;
  background: white;
  flex-direction: column;
  border: 1px solid #645d5d40;

  header {
    border-bottom: 1px solid #645d5d40;
    padding-top: .5rem;
    padding-bottom: .5rem;
    width: 100%;
    display: flex;

    h5 {
      font-size: 1.3rem;
      font-weight: 600;
    }
  }

  section {
    padding-top: .5rem;
    padding-bottom: .5rem;

    h6 {
      font-size: .85rem;
      font-weight: 600;
      margin: 0;
      line-height: 1.2rem;
    }

    span {
      font-size: .85rem;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      gap: .5rem;

      a {
        color: $primary
      }
    }
  }
}

.guide-wrapper {
  max-width: 1200px;
  margin: 0px auto;
}

.order-collection {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
</style>
