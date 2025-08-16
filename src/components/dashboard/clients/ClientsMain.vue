<template>
  <section class="client-main">
    <!--Header-->
    <HeaderPage @do-search="doHandlerSearch" @add-new="showAddButton" :scope="'create-client'" :show-add-button="true"
      :title="t('clientTitle')" />
    <!--End header-->

    <!--Table-->
    <MainTable class="q-mt-lg" :key="pagination.rowsNumber + '-' + pagination.page" :pagination="pagination"
      :columns="columns" :rows="clients" edit-scope="update-client" delete-scope="delete-client"
      @edit="handlerUpdateClient" @delete="doDeleteClients" />
    <!--End table-->

    <!--Modal clients-->
    <q-dialog v-model="modalClient" @before-hide="client = {}">
      <ModalCard :title="!client._id ? t('clientCreate') : t('clientUpdate')">
        <template #body>
          <ClientsForm :client-selected="client" @close-modal="showAddButton" @up-total-item="setTotalItems" />
        </template>
      </ModalCard>
    </q-dialog>
    <!--End modal clients-->
  </section>
</template>

<script setup>
// imports
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { notification } from 'src/boot/notification';
import ClientsForm from './components/ClientsForm.vue';
import { useClientsStore } from 'src/stores/clientsStore';
import ModalCard from 'src/components/partials/ModalCard.vue';
import MainTable from 'src/components/partials/MainTable.vue';
import HeaderPage from 'src/components/partials/HeaderPage.vue';
import { clientsContent } from 'src/composables/clientsContent';

// references
const client = ref({});
const q = useQuasar();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const modalClient = ref(false);
const columns = [
  {
    name: 'dni',
    required: true,
    label: `${t('dni')}`,
    align: 'center',
    field: row => row.dni,
    sortable: false
  },
  {
    name: 'name',
    required: true,
    label: `${t('name')}s`,
    align: 'left',
    field: row => row.name,
    sortable: false
  },
  {
    name: 'lastName',
    required: true,
    label: `${t('lastName')}s`,
    align: 'left',
    field: row => row.last_name,
    sortable: false
  },
  {
    name: 'email',
    required: true,
    label: `${t('email')}s`,
    align: 'left',
    field: row => row.email,
    sortable: false
  },
  {
    name: 'phone',
    required: true,
    label: `${t('phone')}s`,
    align: 'left',
    field: row => row.phone,
    sortable: false
  },
  {
    name: 'address',
    required: true,
    label: `${t('address')}s`,
    align: 'left',
    field: row => row.address,
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
const store = useClientsStore();
const content = clientsContent();

// computed
const clients = computed(() => {
  return store.getClients;
});

// methods
const showAddButton = () => {
  modalClient.value = !modalClient.value;
}

const handlerListCities = async () => {
  const page = route.query.page || 1;
  const search = route.query.search || '';
  const perPage = route.query.perPage || 10;

  const query = `page=${page}&perPage=${perPage}&search=${search}`;

  await content.doListClients(query);
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

const handlerUpdateClient = (id) => {
  const clientObj = clients.value.find((el) => el._id === id);
  client.value = clientObj;
  showAddButton();
}

const doDeleteClients = (id) => {
  const description = t('deleteClientDescription');
  const client = clients.value.find((el) => el._id === id);
  const name = client.name;
  q.dialog({
    title: t('clientDelete'),
    message: description.replace('-name', ` ${name}`),
    cancel: true,
  }).onOk(() => {
    handlerDeleteCities(id);
  });
}

const handlerDeleteCities = async (id) => {
  const data = await content.doDeleteClients(id);

  if (data?.success) {
    notification('success', t('clientDeleted'), 'primary');
    pagination.value.rowsNumber = store.getTotalItems;
  }

  if (clients.value.length === 0) {
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
handlerListCities();
</script>
