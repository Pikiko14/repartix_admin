<template>
  <q-card class="plans-card">
    <!--Header-->
    <q-card-section>
      <p class="text-bold text-h5">
        {{ t('planCardTitle') }}
      </p>
      <q-btn v-close-popup icon="close" class="text-red close-btn absolute-top-right" flat dense rounded>
        <q-tooltip class="bg-red">
          {{ t('close') }}
        </q-tooltip>
      </q-btn>
    </q-card-section>
    <!--End header-->

    <!--plans grids-->
    <q-card-section style="margin-top: -10px">
      a
    </q-card-section>
    <!--End plans grid-->
  </q-card>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

//imports

// references
const { t } = useI18n();
</script>

<style scoped lang="scss">
.plans-card {
  width: 600px;

  @media(width < 768px) {
    width: 100%;
  }
}

.close-btn {
  right: 10px;
  top: 15px;
}
</style>
