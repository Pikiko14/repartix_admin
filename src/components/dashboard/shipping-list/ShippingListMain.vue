<template>
  <section class="shipping-list-main">
    <!--Header-->
    <HeaderPage show-date-picker @filter-by-date="handlerFilterByDate" @do-search="doHandlerSearch"
      @add-new="showAddButton" :scope="'create-sender'" :title="t('shippingList')" />
    <!--End header-->

    <!--Table-->
    <MainTable @show-guide="printPdf" class="q-mt-lg" :key="pagination.rowsNumber + '-' + pagination.page"
      :pagination="pagination" :columns="columns" :rows="shippingList" edit-scope="none"
      show-order-scope="list-shipping-list" delete-scope="delete-shipping-list" @show-order="showShipping"
      @edit="handlerUpdateShippingList" @delete="doDeleteShippingList" />
    <!--End table-->

    <!--Modal shipping-->
    <q-dialog v-model="modalShippingList" @before-hide="sender = {}">
      <ModalCard :title="!sender._id ? t('sendersCreate') : t('sendersUpdate')">
        <template #body>
          {{ shippingList }}
        </template>
      </ModalCard>
    </q-dialog>
    <!--End modal shipping-->
  </section>
</template>

<script setup>
// imports
import { Loading, useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { notification } from 'src/boot/notification';
import ModalCard from 'src/components/partials/ModalCard.vue';
import MainTable from 'src/components/partials/MainTable.vue';
import HeaderPage from 'src/components/partials/HeaderPage.vue';
import { useShippingListStore } from 'src/stores/shippingListStore';
import { shippingListContent } from 'src/composables/shippingListContent';

// references
const sender = ref({});
const q = useQuasar();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const modalShippingList = ref(false);
const columns = [
  {
    name: 'reference',
    required: true,
    label: `${t('reference')}`,
    align: 'left',
    field: row => row.reference,
    sortable: false
  },
  {
    name: 'couriers',
    required: true,
    label: `${t('courier')}`,
    align: 'left',
    field: row => row?.courier?.full_name,
    sortable: false
  },
  {
    name: 'orderQuantity',
    required: true,
    label: `${t('quantity')} ${t('orders').toLowerCase()}`,
    align: 'center',
    field: row => row?.orders?.length,
    sortable: false
  },
  {
    name: 'orderResume',
    required: true,
    label: `${t('relationDelivered')}`,
    align: 'center',
    field: row => row,
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
const store = useShippingListStore();
const content = shippingListContent();

// computed
const shippingList = computed(() => {
  return store.getShippings;
});

// methods
const showAddButton = () => {
  modalShippingList.value = !modalShippingList.value;
}

const handlerListShipping = async () => {
  const page = route.query.page || 1;
  const search = route.query.search || '';
  const perPage = route.query.perPage || 10;

  let query = `page=${page}&perPage=${perPage}&search=${search}`;

  if (route.query.from && route.query.to) {
    query += `&from=${route.query.from}&to=${route.query.to}`;
  }

  await content.doListShippingMethods(query);
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

const handlerUpdateShippingList = (id) => {
  const senderObj = shippingList.value.find((el) => el._id === id);
  sender.value = senderObj;
  showAddButton();
}

const doDeleteShippingList = (id) => {
  const description = t('deleteShippingDescription');
  const shipping = shippingList.value.find((el) => el._id === id);
  const name = shipping.reference;
  q.dialog({
    title: t('shippingListDelete'),
    message: description.replace('-name', ` ${name}`),
    cancel: true,
  }).onOk(() => {
    handlerDeleteShipping(id);
  });
}

const handlerDeleteShipping = async (id) => {
  const data = await content.doDeleteShippingList(id);
  if (data?.success) {
    notification('success', t('sendersDeleted'), 'primary');
    pagination.value.rowsNumber = store.getTotalItems;
  }

  if (shippingList.value.length === 0) {
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

const showShipping = async (id) => {
  Loading.show();
  try {
    await content.doFilterShippingList(id);
    router.push({
      name: 'shipping-list-show',
      params: {
        id,
      },
    });
  } finally {
    Loading.hide();
  }
}

const printPdf = async (id) => {
  Loading.show();
  try {
    const data = await content.loadShippingPdf(id);
    if (data.success) {
      notification('success', t('documentGenerated'), 'primary');
    }
  } finally {
    Loading.hide();
  }
}

const handlerFilterByDate = (date) => {
  const query = {
    page: 1,
    perPage: route.query.perPage || 10,
    search: route.query.search || '',
    from: date?.from,
    to: date?.to,
  }

  router.push({
    name: route.name,
    query,
  });
}

// hook
if (route.query.page) {
  pagination.value.page = parseInt(route.query.page);
}
if (route.query.perPage) {
  pagination.value.rowsPerPage = parseInt(route.query.perPage);
}
handlerListShipping();
</script>
