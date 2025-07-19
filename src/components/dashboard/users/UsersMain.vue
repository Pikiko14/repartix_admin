<template>
  <section class="users-main">
    <!--Header-->
    <HeaderPage @do-search="doHandlerSearch" @add-new="showAddButton" :scope="'create-user'" :show-add-button="true"
      :title="t('usersTitle')" />
    <!--End header-->

    <!--Table-->
    <MainTable class="q-mt-lg" :key="pagination.rowsNumber + '-' + pagination.page" :pagination="pagination"
      :columns="columns" :rows="users" edit-scope="update-user" delete-scope="delete-user"
      @edit-user="handlerUpdateUser" />
    <!--End table-->

    <!--Modal user-->
    <q-dialog v-model="modalUser" @before-hide="user = {}">
      <ModalCard :title="!user._id ? t('addUser') : t('editUser')">
        <template #body>
          <UserForm :user-selected="user" @close-modal="showAddButton" />
        </template>
      </ModalCard>
    </q-dialog>
    <!--End modal user-->
  </section>
</template>

<script setup>
// imports
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import UserForm from './components/UserForm.vue';
import { usersContent } from 'src/composables/usersContent';
import ModalCard from 'src/components/partials/ModalCard.vue';
import MainTable from 'src/components/partials/MainTable.vue';
import HeaderPage from 'src/components/partials/HeaderPage.vue';
import { useUsersStore } from 'src/stores/usersStore';

// references
const user = ref({});
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const modalUser = ref(false);
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
    name: 'email',
    required: true,
    label: t('email'),
    align: 'left',
    field: row => row.email,
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
    name: 'type',
    label: t('typeUser'),
    align: 'center',
    field: row => row.type_user,
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
const store = useUsersStore();
const content = usersContent();

// computed
const users = computed(() => {
  return store.getUsers;
});

// methods
const showAddButton = () => {
  modalUser.value = !modalUser.value;
}

const handlerListUsers = async () => {
  const page = route.query.page || 1;
  const search = route.query.search || '';
  const perPage = route.query.perPage || 10;

  const query = `page=${page}&perPage=${perPage}&search=${search}`;

  await content.doListUser(query);
  pagination.value.rowsNumber = store.getTotalItems;
}

const doHandlerSearch = (search) => {
  router.push({
    name: 'users',
    query: {
      page: route.query.page || 1,
      perPage: route.query.perPage,
      search: search || '',
    }
  });
}

const handlerUpdateUser = (id) => {
  const userObj = users.value.find((el) => el._id === id);
  user.value = userObj;
  showAddButton();
}

// hook
if (route.query.page) {
  pagination.value.page = parseInt(route.query.page);
}
if (route.query.perPage) {
  pagination.value.rowsPerPage = parseInt(route.query.perPage);
}
handlerListUsers();
</script>
