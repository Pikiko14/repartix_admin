<template>
  <section class="users-main">
    <!--Header-->
    <HeaderPage @add-new="showAddButton" :show-add-button="true" :title="t('usersTitle')" />
    <!--End header-->

    <!--Table-->
    <MainTable :columns="columns" />
    <!--End table-->

    <!--Modal user-->
    <q-dialog v-model="modalUser">
      <ModalCard :title="t('addUser')">
        <template #body>
          <UserForm @close-modal="showAddButton" />
        </template>
      </ModalCard>
    </q-dialog>
    <!--End modal user-->
  </section>
</template>

<script setup>
// imports
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import UserForm from './components/UserForm.vue';
import ModalCard from 'src/components/partials/ModalCard.vue';
import MainTable from 'src/components/partials/MainTable.vue';
import HeaderPage from 'src/components/partials/HeaderPage.vue';

// references
const { t } = useI18n();
const modalUser = ref(false);
const columns = [
  {
    name: 'name',
    required: true,
    label: t('name'),
    align: 'left',
    field: row => row.name,
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
    align: 'left',
    field: row => row.type_user,
    sortable: false
  },
  {
    name: 'options',
    required: true,
    label: t('options'),
    align: 'center',
  },
]


// methods
const showAddButton = () => {
  modalUser.value = !modalUser.value;
}
</script>
