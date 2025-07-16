<template>
  <section class="users-main">
    <!--Header-->
    <HeaderPage @add-new="showAddButton" :show-add-button="true" :title="t('usersTitle')" />
    <!--End header-->

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
import HeaderPage from 'src/components/partials/HeaderPage.vue';

// references
const { t } = useI18n();
const modalUser = ref(false);


// methods
const showAddButton = () => {
  modalUser.value = !modalUser.value;
}
</script>
