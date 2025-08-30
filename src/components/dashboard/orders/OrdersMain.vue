<template>
  <section class="order-main">
    <!--Header-->
    <HeaderPage @do-filter="handlerFilter" @filter-by-date="handlerFilterByDate" :show-date-picker="true"
      @do-search="doHandlerSearch" @add-new="showAddButton" show-filters :filter-items="filterItems"
      :scope="'create-order'" show-add-button :title="t('ordersTitle')" @clear-filter="handlerClearFilters" />
    <!--End header-->

    <!--Table-->
    <MainTable class="q-mt-lg" :key="pagination.rowsNumber + '-' + pagination.page" :pagination="pagination"
      :columns="columns" :rows="orders" show-order-scope="list-order" edit-scopecope edit-scope="update-order"
      delete-scope="delete-order" @edit="handlerUpdateOrder" @delete="doDeleteOrder" @show-guide="showGuide"
      @show-order="showOrder" />
    <!--End table-->

    <!--Modal order-->
    <q-dialog v-model="modalOrder" @before-hide="order = {}">
      <ModalCard styles="width: 800px" :title="!order?.date ? t('ordersCreate') : t('ordersUpdate')">
        <template #body>
          <OrdersForm :order-selected="order" @close-modal="showAddButton" @up-total-item="setTotalItems" />
        </template>
      </ModalCard>
    </q-dialog>
    <!--End modal order-->
  </section>
</template>

<script setup>
// imports
import { Loading, useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { Utils } from 'src/utils/utils';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/authStore';
import { notification } from 'src/boot/notification';
import OrdersForm from './components/OrdersForm.vue';
import { useOrdersStore } from 'src/stores/ordersStore';
import ModalCard from 'src/components/partials/ModalCard.vue';
import MainTable from 'src/components/partials/MainTable.vue';
import { ordersContent } from 'src/composables/ordersContent';
import { guidesContent } from 'src/composables/guidesContent';
import HeaderPage from 'src/components/partials/HeaderPage.vue';

// references
const order = ref({});
const q = useQuasar();
const { t } = useI18n();
const route = useRoute();
const utils = new Utils();
const router = useRouter();
const modalOrder = ref(false);
const columns = [
  {
    name: 'reference',
    required: true,
    label: `${t('reference')}`,
    align: 'left',
    field: row => row?.reference,
    sortable: false
  },
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
    field: row => row?.cash_on_delivery ? utils.formatPrice(parseFloat(row?.cash_amount.replace('.', '')) || 0) : utils.formatPrice(0),
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
const authStore = useAuthStore();
const contentGuides = guidesContent();

// computed
const orders = computed(() => {
  return store.getOrders;
});

const configuration = computed(() => authStore.getConfiguration);

const filterItems = computed(() => {
  const itemsStatus = [
    {
      label: t('pending'),
      value: 'pending',
    },
    {
      label: t('in_progress'),
      value: 'in_progress',
    },
    {
      label: t('delivered'),
      value: 'delivered',
    },
    {
      label: t('cancelled'),
      value: 'cancelled',
    },
    {
      label: t('returned'),
      value: 'returned',
    },
    {
      label: t('guide_printed'),
      value: 'guide_printed',
    },
    {
      label: t('guide_news'),
      value: 'guide_news',
    },
    {
      label: t('all'),
      value: 'all',
    },
  ];

  if (configuration.value?.statuses) {
    const complementStatuses = configuration.value?.statuses?.split('\n');

    for (const status of complementStatuses) {
      itemsStatus.push({
        label: status,
        value: status,
      });
    }
  }

  return [
    {
      label: t('status'),
      key: 'status',
      items: itemsStatus
    },
    {
      label: t('cashOnDelivery'),
      key: 'cash_on_delivery',
      items: [
        {
          label: t('yes'),
          value: true,
        },
        {
          label: t('no'),
          value: false,
        },
        {
          label: t('all'),
          value: 'all',
        }
      ]
    },
    {
      label: t('settledToSender'),
      key: 'settled_to_sender',
      items: [
        {
          label: t('yes'),
          value: true,
        },
        {
          label: t('no'),
          value: false,
        },
        {
          label: t('all'),
          value: 'all',
        }
      ]
    }
  ];
});

// methods
const showAddButton = () => {
  modalOrder.value = !modalOrder.value;
}

const handlerListOrders = async () => {
  const page = route.query.page || 1;
  const search = route.query.search || '';
  const perPage = route.query.perPage || 10;
  const from = route.query.from || null;
  const to = route.query.to || null;

  let query = `page=${page}&perPage=${perPage}&search=${search}`;

  if (from && to) {
    query += `&from=${from}&to=${to}`;
  }

  if (route.query.filters) {
    query += `&filters=${route.query.filters}`;
  }


  await content.doListOrders(query);
  pagination.value.rowsNumber = store.getTotalItems;
}

const doHandlerSearch = (search) => {
  const query = {
    page: route.query.page || 1,
    perPage: route.query.perPage,
    search: search || '',
  }

  if (route.query.from && route.query.to) {
    query.from = route.query.from;
    query.to = route.query.to;
  }

  if (route.query.filters) {
    query.filters = route.query.filters;
  }

  router.push({
    name: route.name,
    query
  });
}

const handlerFilterByDate = (date) => {
  const query = {
    page: route.query.page || 1,
    perPage: route.query.perPage || 10,
    search: route.query.search || '',
    from: date?.from,
    to: date?.to,
  }

  if (route.query.filters) {
    query.filters = route.query.filters;
  }

  router.push({
    name: route.name,
    query,
  });
}

const handlerUpdateOrder = async (id) => {
  try {
    Loading.show();
    const response = await content.doShowOrder(id);
    if (response?.success) {
      delete response?.order?.__v;
      delete response?.order?.createdAt;
      delete response?.order?.updatedAt;
      order.value = response.order;
      showAddButton();
    }
  } finally {
    Loading.hide();
  }
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

const handlerFilter = ({ key, value }) => {
  let filters = route.query.filters ? JSON.parse(route.query.filters) : {};
  filters[key] = value;

  if (value === 'all') delete filters[key];

  const query = {
    page: parseInt(route.query.page) - 1 || 1,
    perPage: route.query.perPage,
    search: route.query.search || '',
  }

  if (route.query.from && route.query.to) {
    query.from = route.query.from;
    query.to = route.query.to;
  }

  const keys = Object.keys(filters);
  if (keys.length > 0) {
    query.filters = JSON.stringify(filters);
  }

  router.push({
    name: route.name,
    query,
  });
}

const handlerClearFilters = () => {
  const query = {
    page: parseInt(route.query.page) - 1 || 1,
    perPage: route.query.perPage,
    search: route.query.search || '',
  }

  if (route.query.from && route.query.to) {
    query.from = route.query.from;
    query.to = route.query.to;
  }

  router.push({
    name: route.name,
    query,
  });
}

const setTotalItems = () => {
  pagination.value.rowsNumber = store.getTotalItems;
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

const showOrder = async (id) => {
  Loading.show();
  try {
    const data = await content.doShowOrder(id);
    if (data?.success) {
      router.push({
        name: 'showOrder',
        params: {
          id: data?.order?._id,
        }
      });
    }
  } finally {
    Loading.hide();
  }
}

// hook
if (route.query.page) {
  pagination.value.page = parseInt(route.query.page);
}
if (route.query.perPage) {
  pagination.value.rowsPerPage = parseInt(route.query.perPage);
}
handlerListOrders();
</script>
