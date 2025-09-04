<template>
  <div class="row guide-wrapper" v-if="shippingList._id">
    <div class="col-12 header-shipping">
      <h5 class="title text-bold">
        {{ t('shippingList') }} #{{ shippingList.reference }}
      </h5>

      <div class="header-shipping-actions">
        <q-btn @click="openModal"
          v-if="utils.validateRole('update-shipping-list') && !shippingList.is_close" rounded color="primary" no-caps
          unelevated :label="t('addOrder')"></q-btn>
      </div>
    </div>

    <div class="col-12 q-mt-md">
      <article class="show-order-article q-mt-lg">
        <header>
          <h5 class="text-primary">
            {{ t('delivery').substring(0, 10) }}
          </h5>
        </header>

        <section class="row">
          <div class="col-12 col-md-4">
            <h6>
              {{ t('name') }}
            </h6>
            <span>{{ shippingList?.courier?.full_name || '-' }}</span>
          </div>
          <div class="col-12 col-md-4">
            <h6>
              {{ t('typeVehicle') }}
            </h6>
            <span class="text-">
              <span>{{ t(shippingList.courier.vehicle_type) }}</span>
            </span>
          </div>
          <div class="col-12 col-md-4">
            <h6>
              {{ t('phone') }}
            </h6>
            <span class="text-primary cursor-pointer" v-if="shippingList?.courier">
              <a :href="`tel:${shippingList?.client?.phone}`">{{ shippingList?.courier?.phone }}</a>
              <q-btn size="sm" @click="openWhatSapp(shippingList?.courier?.phone?.replace(/\D/g, ''))" flat dense
                rounded icon="img:/images/whatsapp.png" />
            </span>
            <span v-else>-</span>
          </div>
        </section>
      </article>
    </div>

    <div class="col-12 q-mt-md">
      <h6 class="text-h6 text-bold">
        {{ t('orders') }}
      </h6>
      <q-markup-table flat class="shadow-0 q-mt-md">
        <thead>
          <tr>
            <th class="text-left">
              {{ t('reference') }}
            </th>
            <th class="text-center">
              {{ t('status') }}
            </th>
            <th class="text-left">
              {{ t('client').substring(0, 7) }}
            </th>
            <th class="text-right">
              {{ t('priceDelivery') }}
            </th>
            <th class="text-right">
              {{ t('cashOnDelivery') }}
            </th>
            <th class="text-right">
              {{ t('cashAmount') }}
            </th>
            <th class="text-center">
              {{ t('options') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(shipping, idx) in shippingList.orders" :key="idx">
            <td class="text-left">
              {{ shipping.reference }}
            </td>
            <td class="text-center">
              <q-chip square size="8pt" class="primary text-bold text-white chip-status"
                :class="[statusColor[shipping.status] || 'bg-purple-10']">
                <span>
                  {{ status[shipping.status] || shipping.status }}
                </span>
              </q-chip>
            </td>
            <td>
              {{ `${shipping?.client?.name} ${shipping?.client?.last_name}` }}
            </td>
            <td class="text-right">
              {{ utils.formatPrice(shipping?.order_price) }}
            </td>
            <td class="text-right">
              {{ shipping.cash_on_delivery ? t('yes') : t('no') }}
            </td>
            <td class="text-right">
              {{ utils.formatPrice(parseFloat(shipping.cash_amount.replace('.', ''))) }}
            </td>
            <td class="text-center">
              <q-btn :to="`/dashboard/show/${shipping.id}/orders`" v-if="utils.validateRole('list-order')"
                icon="visibility" flat dense rounded color="primary">
                <q-tooltip class="bg-primary">
                  {{ t('showOrder') }}
                </q-tooltip>
              </q-btn>
              <q-btn @click="deleteOrder(shipping.id)" v-if="utils.validateRole('update-shipping-list')" icon="delete"
                flat dense rounded color="red">
                <q-tooltip class="bg-red">
                  {{ t('delete') }}
                </q-tooltip>
              </q-btn>
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>

    <div class="col-12 q-mt-lg text-center">
      <q-btn @click="handlerUpdateShippingList" unelevated color="primary" no-caps rounded :label="t('save')"
        v-if="utils.validateRole('update-shipping-list') && enableEdit && !shippingList.is_close"></q-btn>
    </div>

    <q-dialog v-model="openModalAddOrder">
      <ModalCard :title="t('addOrder')">
        <template #body>
          <FormAddOrder @close-modal="openModal" />
        </template>
      </ModalCard>
    </q-dialog>
  </div>
</template>

<script setup>
// imports
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Utils } from 'src/utils/utils';
import { Loading, useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/authStore';
import { notification } from 'src/boot/notification';
import FormAddOrder from './components/FormAddOrder.vue';
import ModalCard from 'src/components/partials/ModalCard.vue';
import { useShippingListStore } from 'src/stores/shippingListStore';
import { shippingListContent } from 'src/composables/shippingListContent';

// references
const q = useQuasar();
const { t } = useI18n();
const route = useRoute();
const utils = new Utils();
const loading = ref(false);
const authStore = useAuthStore();
const store = useShippingListStore();
const openModalAddOrder = ref(false);
const content = shippingListContent();

const status = {
  pending: t('pending'),
  in_progress: t('in_progress'),
  delivered: t('delivered'),
  cancelled: t('cancelled'),
  returned: t('returned'),
  'guide-printed': t('guide_printed'),
  guide_news: t('guide_news'),
}

const statusColor = {
  pending: 'bg-yellow',
  in_progress: 'bg-primary',
  delivered: 'bg-blue-10',
  cancelled: 'bg-red',
  returned: 'bg-warning',
  'guide-printed': 'bg-green',
  guide_news: 'bg-warning',
}

// computed
const shippingList = computed(() => {
  return store.getShipping;
});

const brand = computed(() => {
  return authStore.user?.brand || {};
});

const enableEdit = computed(() => {
  return store.getEnableEdit;
});

// methods
const loadShippingData = async (id) => {
  Loading.show();
  try {
    await content.doFilterShippingList(id);
  } finally {
    Loading.hide();
  }
}

const openWhatSapp = (phone) => {
  window.open(`https://wa.me/${phone}?text=${t('whastappText').replace('-business', brand.value.name)}`, '_blank');
}

const deleteOrder = async (id) => {
  const description = t('deleteOrdersDescription');
  const order = shippingList.value?.orders.find((el) => el.id === id);
  const name = order.reference;
  q.dialog({
    title: t('orderDelete'),
    message: description.replace('-name', ` ${name}`),
    cancel: true,
  }).onOk(() => {
    handlerDeleteOrder(id);
  });
}

const handlerDeleteOrder = async (id) => {
  content.doDeleteOrder(id);
}

const handlerUpdateShippingList = async () => {
  loading.value = true
  try {
    const data = await content.doUpdateShippingList(shippingList.value);
    if (data.succes) {
      notification('success', t('shippingListUpdateSuccess'), 'primary');
    }
  } finally {
    loading.value = false;
  }
}

const openModal = () => {
  openModalAddOrder.value = !openModalAddOrder.value;
}

// hook
if (route.params.id && !store.getShipping._id) {
  loadShippingData(route.params.id);
}
</script>

<style scoped lang="scss">
.title {
  font-size: 1.5rem;
  font-weight: 600;
}

.guide-wrapper {
  max-width: 1200px;
  margin: 0px auto;
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

.header-shipping {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
