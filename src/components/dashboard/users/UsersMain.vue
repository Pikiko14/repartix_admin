<template>
  <section class="users-main">
    <!--Header-->
    <HeaderPage @add-new="showAddButton" :show-add-button="true" :title="t('usersTitle')" />
    <!--End header-->
  </section>
</template>

<script setup>
// imports
import { useI18n } from 'vue-i18n';
import HeaderPage from 'src/components/partials/HeaderPage.vue';

// references
const { t } = useI18n();

// methods
const showAddButton = () => {
  alert(123);
}
</script>
