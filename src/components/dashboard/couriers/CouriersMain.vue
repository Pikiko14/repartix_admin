<template>
  <section class="users-main">
    <!--Header-->
    <HeaderPage @do-search="doHandlerSearch" @add-new="showAddButton" :scope="'create-couriers'" :show-add-button="true"
      :title="t('delivery')" />
    <!--End header-->

    <!--Table-->
    <MainTable class="q-mt-lg" :key="pagination.rowsNumber + '-' + pagination.page" :pagination="pagination"
      :columns="columns" :rows="couriers" edit-scope="update-couriers" delete-scope="delete-couriers"
      @edit="handlerUpdateCourier" @delete="doDeleteCourier" />
    <!--End table-->

    <!--Modal couriers-->
    <q-dialog v-model="modalCouriers" @before-hide="user = {}">
      <ModalCard :title="!courier._id ? t('addDelivery') : t('editDelivery')">
        <template #body>
          <CourierForm :courier-selected="courier" @close-modal="showAddButton" @up-total-item="setTotalItems" />
        </template>
      </ModalCard>
    </q-dialog>
    <!--End modal couriers-->
  </section>
</template>

<script setup>
// imports
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { notification } from 'src/boot/notification';
import CourierForm from './components/CourierForm.vue';
import { useCouriersStore } from 'src/stores/couriersStore';
import ModalCard from 'src/components/partials/ModalCard.vue';
import MainTable from 'src/components/partials/MainTable.vue';
import HeaderPage from 'src/components/partials/HeaderPage.vue';
import { couriersContent } from 'src/composables/couriersContent';

// references
const courier = ref({});
const q = useQuasar();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const modalCouriers = ref(false);
const columns = [
  {
    name: 'name',
    required: true,
    label: t('username'),
    align: 'left',
    field: row => row.username,
    sortable: false
  },
  {
    name: 'fullName',
    label: t('fullName'),
    align: 'left',
    field: row => row.profile.full_name,
    sortable: false
  },
  {
    name: 'email',
    required: true,
    label: t('email'),
    align: 'left',
    field: row => row.email,
    sortable: false
  },
  {
    name: 'phone',
    required: true,
    label: t('phone'),
    align: 'left',
    field: row => row?.profile?.phone || '',
    sortable: false
  },
  {
    name: 'vehicleType',
    required: true,
    label: t('typeVehicle'),
    align: 'left',
    field: row => t(row?.courier_info?.vehicle_type) || '',
    sortable: false
  },
  {
    name: 'contractType',
    required: true,
    label: t('contractType'),
    align: 'left',
    field: row => t(row?.courier_info?.contract_type) || '',
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
const store = useCouriersStore();
const content = couriersContent();

// computed
const couriers = computed(() => {
  return store.getCouriers;
});

// methods
const showAddButton = () => {
  modalCouriers.value = !modalCouriers.value;
}

const handlerListCouriers = async () => {
  const page = route.query.page || 1;
  const search = route.query.search || '';
  const perPage = route.query.perPage || 10;

  const query = `page=${page}&perPage=${perPage}&search=${search}`;

  await content.doListCourier(query);
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

const handlerUpdateCourier = (id) => {
  const courierObj = couriers.value.find((el) => el._id === id);
  courier.value = courierObj;
  showAddButton();
}

const doDeleteCourier = (id) => {
  const description = t('deleteCouriersDescription');
  const courier = couriers.value.find((el) => el._id === id);
  const name = courier.username;
  q.dialog({
    title: t('deleteCouriers'),
    message: description.replace('-id', ` ${name}`),
    cancel: true,
  }).onOk(() => {
    handlerDeleteCourier(id);
  });
}

const handlerDeleteCourier = async (id) => {
  const data = await content.doDeleteCouriers(id);

  if (data?.success) {
    notification('success', t('courierDeleted'), 'primary');
    pagination.value.rowsNumber = store.getTotalItems;
  }

  if (couriers.value.length === 0) {
    router.push({
      name: 'couriers',
      query: {
        page: parseInt(route.query.page) - 1 || 1,
        perPage: route.query.perPage,
        search: route.query.search || '',
      }
    });
  }
}

const setTotalItems = () => {
  pagination.value.rowsNumber = store.getTotalItems;
}

// hook
if (route.query.page) {
  pagination.value.page = parseInt(route.query.page);
}
if (route.query.perPage) {
  pagination.value.rowsPerPage = parseInt(route.query.perPage);
}
handlerListCouriers();
</script>
