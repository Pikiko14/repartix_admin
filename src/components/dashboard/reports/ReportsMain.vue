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
    <div class="col-12 col-md-6 q-mt-lg" :class="{ 'q-pr-md': $q.screen.gt.sm }">
      <CardReport :title="t('liquidations')" :reportList="liquidationReports" />
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
  {
    label: t('performanceReport') || 'Reporte de Rendimiento',
    to: '/dashboard/reports/performance',
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
  {
    label: t('performanceReportByCourier') || 'Reporte de Rendimiento por Repartidor',
    to: '/dashboard/reports/performance?type=courier',
  },
];

// liquidation reports
const liquidationReports = [
  {
    label: t('liquidationOrder'),
    to: '/dashboard/reports/order-liquidation',
  },
];
</script>
