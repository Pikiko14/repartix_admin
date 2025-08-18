<template>
  <section class="sender-main">
    <!--Header-->
    <HeaderPage @do-search="doHandlerSearch" @add-new="showAddButton" :scope="'create-sender'" :show-add-button="true"
      :title="t('sendersTitle')" />
    <!--End header-->

    <!--Table-->
    <MainTable class="q-mt-lg" :key="pagination.rowsNumber + '-' + pagination.page" :pagination="pagination"
      :columns="columns" :rows="senders" edit-scope="update-sender" delete-scope="delete-sender"
      @edit="handlerUpdateSenders" @delete="doDeleteSenders" />
    <!--End table-->

    <!--Modal senders-->
    <q-dialog v-model="modalSender" @before-hide="sender = {}">
      <ModalCard :title="!sender._id ? t('sendersCreate') : t('sendersUpdate')">
        <template #body>
          <SendersForm :sender-selected="sender" @close-modal="showAddButton" @up-total-item="setTotalItems" />
        </template>
      </ModalCard>
    </q-dialog>
    <!--End modal senders-->
  </section>
</template>

<script setup>
// imports
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { notification } from 'src/boot/notification';
import SendersForm from './components/SendersForm.vue';
import { useSendersStore } from 'src/stores/sendersStore';
import ModalCard from 'src/components/partials/ModalCard.vue';
import MainTable from 'src/components/partials/MainTable.vue';
import HeaderPage from 'src/components/partials/HeaderPage.vue';
import { sendersContent } from 'src/composables/sendersContent';

// references
const sender = ref({});
const q = useQuasar();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const modalSender = ref(false);
const columns = [
  {
    name: 'manager',
    required: true,
    label: `${t('manager')}`,
    align: 'left',
    field: row => row.sender_info.manager,
    sortable: false
  },
  {
    name: 'brandName',
    required: true,
    label: `${t('brandName')}`,
    align: 'left',
    field: row => row.sender_info.brand_name,
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
    field: row => row.sender_info.brand_phone,
    sortable: false
  },
  {
    name: 'address',
    required: true,
    label: `${t('address')}es`,
    align: 'center',
    field: row => row.sender_info.address.length,
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
const store = useSendersStore();
const content = sendersContent();

// computed
const senders = computed(() => {
  return store.getSenders;
});

// methods
const showAddButton = () => {
  modalSender.value = !modalSender.value;
}

const handlerListSenders = async () => {
  const page = route.query.page || 1;
  const search = route.query.search || '';
  const perPage = route.query.perPage || 10;

  const query = `page=${page}&perPage=${perPage}&search=${search}`;

  await content.doListSenders(query);
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

const handlerUpdateSenders = (id) => {
  const senderObj = senders.value.find((el) => el._id === id);
  sender.value = senderObj;
  showAddButton();
}

const doDeleteSenders = (id) => {
  const description = t('deleteSenderDescription');
  const sender = senders.value.find((el) => el._id === id);
  const name = sender.sender_info.brand_name;
  q.dialog({
    title: t('sendersDelete'),
    message: description.replace('-name', ` ${name}`),
    cancel: true,
  }).onOk(() => {
    handlerDeleteSenders(id);
  });
}

const handlerDeleteSenders = async (id) => {
  const data = await content.doDeleteSender(id);

  if (data?.success) {
    notification('success', t('sendersDeleted'), 'primary');
    pagination.value.rowsNumber = store.getTotalItems;
  }

  if (senders.value.length === 0) {
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
handlerListSenders();
</script>
