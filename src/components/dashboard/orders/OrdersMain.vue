<template>
  <section class="order-main">
    <!--Header-->
    <HeaderPage @do-search="doHandlerSearch" @add-new="showAddButton" :scope="'create-order'" :show-add-button="true"
      :title="t('ordersTitle')" />
    <!--End header-->

    <!--Table-->
    <MainTable class="q-mt-lg" :key="pagination.rowsNumber + '-' + pagination.page" :pagination="pagination"
      :columns="columns" :rows="orders" edit-scope="update-order" delete-scope="delete-order"
      @edit="handlerUpdateOrder" @delete="doDeleteOrder" />
    <!--End table-->

    <!--Modal order-->
    <q-dialog v-model="modalOrder" @before-hide="order = {}">
      <ModalCard :title="!order._id ? t('ordersCreate') : t('ordersUpdate')">
        <template #body>
          asd
        </template>
      </ModalCard>
    </q-dialog>
    <!--End modal order-->
  </section>
</template>

<script setup>
// imports
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { Utils } from 'src/utils/utils';
import { useRoute, useRouter } from 'vue-router';
import { notification } from 'src/boot/notification';
// import ClientsForm from './components/ClientsForm.vue';
import { useOrdersStore } from 'src/stores/ordersStore';
import ModalCard from 'src/components/partials/ModalCard.vue';
import MainTable from 'src/components/partials/MainTable.vue';
import HeaderPage from 'src/components/partials/HeaderPage.vue';
import { ordersContent } from 'src/composables/ordersContent';

// references
const order = ref({});
const q = useQuasar();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const utils = new Utils();
const modalOrder = ref(false);
const columns = [
  {
    name: 'sender',
    required: true,
    label: `${t('senderOrder')}`,
    align: 'left',
    field: row => row?.sender?.brand_name,
    sortable: false
  },
  {
    name: 'clientOrder',
    required: true,
    label: `${t('clientOrder')}`,
    align: 'left',
    field: row => `${row?.client?.name} ${row?.client?.last_name}`,
    sortable: false
  },
  {
    name: 'cashOnDelivery',
    required: true,
    label: `${t('cashOnDelivery')}`,
    align: 'center',
    field: row => row?.cash_on_delivery,
    sortable: false
  },
  {
    name: 'cashAmount',
    required: true,
    label: `${t('cashAmount')}`,
    align: 'center',
    field: row => utils.formatPrice(row?.cash_amount || 0),
    sortable: false
  },
  {
    name: 'price',
    required: true,
    label: `${t('priceDelivery')}`,
    align: 'center',
    field: row => utils.formatPrice(row?.order_price || 0),
    sortable: false
  },
  {
    name: 'status',
    required: true,
    label: `${t('status')}`,
    align: 'center',
    field: row => row?.status,
    sortable: false
  },
  {
    name: 'options',
    required: true,
    label: t('options'),
    align: 'center',
  },
];
const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: route.query.page || 1,
  rowsPerPage: route.query.perPage || 10,
  rowsNumber: 1,
});
const store = useOrdersStore();
const content = ordersContent();

// computed
const orders = computed(() => {
  return store.getOrders;
});

// methods
const showAddButton = () => {
  modalOrder.value = !modalOrder.value;
}

const handlerListOrders = async () => {
  const page = route.query.page || 1;
  const search = route.query.search || '';
  const perPage = route.query.perPage || 10;

  const query = `page=${page}&perPage=${perPage}&search=${search}`;

  await content.doListOrders(query);
  pagination.value.rowsNumber = store.getTotalItems;
}

const doHandlerSearch = (search) => {
  router.push({
    name: route.name,
    query: {
      page: route.query.page || 1,
      perPage: route.query.perPage,
      search: search || '',
    }
  });
}

const handlerUpdateOrder = (id) => {
  const orderObj = orders.value.find((el) => el._id === id);
  order.value = orderObj;
  showAddButton();
}

const doDeleteOrder = (id) => {
  const description = t('deleteOrdersDescription');
  const order = orders.value.find((el) => el._id === id);
  const name = order._id;
  q.dialog({
    title: t('orderDelete'),
    message: description.replace('-name', ` ${name}`),
    cancel: true,
  }).onOk(() => {
    handlerDeleteOrder(id);
  });
}

const handlerDeleteOrder = async (id) => {
  const data = await content.doDeleteOrder(id);

  if (data?.success) {
    notification('success', t('ordersDeleted'), 'primary');
    pagination.value.rowsNumber = store.getTotalItems;
  }

  if (orders.value.length === 0) {
    router.push({
      name: route.name,
      query: {
        page: parseInt(route.query.page) - 1 || 1,
        perPage: route.query.perPage,
        search: route.query.search || '',
      }
    });
  }
}

// const setTotalItems = () => {
//   pagination.value.rowsNumber = store.getTotalItems;
// }

// hook
if (route.query.page) {
  pagination.value.page = parseInt(route.query.page);
}
if (route.query.perPage) {
  pagination.value.rowsPerPage = parseInt(route.query.perPage);
}
handlerListOrders();
</script>
