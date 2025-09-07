<template>
  <section class="row">
    <div class="col-12">
      <h2 class="text-primary page-title">
        {{ t('reports') }}
      </h2>
    </div>

    <div class="col-12 col-md-6" :class="{ 'q-pr-md': $q.screen.gt.sm }">
      <CardReport :title="t('orders')" :reportList="ordersReports" />
    </div>
    <div class="col-12 col-md-6" :class="{ 'q-pl-md': $q.screen.gt.sm }">
      <CardReport :title="t('courier')" :reportList="couriersReports" />
    </div>
  </section>
</template>

<script setup>
// imports
import { useI18n } from 'vue-i18n';
import CardReport from './components/CardReport.vue';

// references
const { t } = useI18n();
// orders reports
const ordersReports = [
  {
    label: t('diaryOder'),
    to: '/dashboard/reports/diary-order',
  },
  {
    label: t('effectivenessRatio'),
    to: '/dashboard/reports/diary-order?methods=effectiveness-ratio',
  },
];

// couriers reports
const couriersReports = [
  {
    label: t('diaryOderByCouriers'),
    to: '/dashboard/reports/diary-order?type=courier',
  },
  {
    label: t('effectivenessRatio'),
    to: '/dashboard/reports/diary-order?type=courier&methods=effectiveness-ratio',
  },
];
</script>
