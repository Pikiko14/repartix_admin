<template>
  <section class="row full-width" :class="{ 'q-mt-lg': $q.screen.lt.lg }">
    <!--Counter-->
    <div class="repartix-dashboard__cards">
      <q-card class="shadow-0">
        <q-card-section class="grid">
          <p class="title text-primary">
            {{ t('toLiquidate') }}:
          </p>
          <p class="value">
            <AnimatedCounter v-if="report.totalOrdersLiquidated" :value="report.totalOrdersLiquidated || 0"
              :duration="500" class="counter" />
            <span v-else>0</span>
          </p>
        </q-card-section>
      </q-card>

      <q-card class="shadow-0">
        <q-card-section class="grid">
          <p class="title text-primary">
            {{ t('noLiquidate') }}:
          </p>
          <p class="value">
            <AnimatedCounter v-if="report.ordersNoSettled" :value="report.ordersNoSettled || 0"
              :duration="500" class="counter" />
            <span v-else>0</span>
          </p>
        </q-card-section>
      </q-card>

      <q-card class="shadow-0">
        <q-card-section class="grid">
          <p class="title text-primary">
            {{ t('collection') }}:
          </p>
          <p class="value-amount">
            {{ utils.formatPrice(report.totalCollection || 0) || 0 }}
          </p>
        </q-card-section>
      </q-card>

      <q-card class="shadow-0">
        <q-card-section class="grid">
          <p class="title text-primary">
            {{ t('totalAmountLiquidate') }}:
          </p>
          <p class="value-amount">
            {{ utils.formatPrice(report.totalLiquidate || 0) || 0 }}
          </p>
        </q-card-section>
      </q-card>

      <q-card class="shadow-0">
        <q-card-section class="grid">
          <p class="title text-primary">
            {{ t('comission') }}:
          </p>
          <p class="value-amount">
            {{ utils.formatPrice(report.totalComission || 0) || 0 }}
          </p>
        </q-card-section>
      </q-card>
    </div>
    <!--End counter-->

    <!--table-->
    <div class="col-12 q-mt-lg">
      <q-markup-table flat class="shadow-0">
        <thead>
          <tr>
            <th class="text-left">
              {{ t('reference') }}
            </th>
            <th class="text-left">
              {{ t('senderOrder') }}
            </th>
            <th class="text-left">
              {{ t('clientOrder') }}
            </th>
            <th class="text-center">
              {{ t('cashOnDelivery') }}
            </th>
            <th class="text-right">
              {{ t('cashAmount') }}
            </th>
            <th class="text-right">
              {{ t('totalCashCollected') }}
            </th>
            <th class="text-right">
              {{ t('priceDelivery') }}
            </th>
            <th class="text-right">
              {{ t('comission') }}
            </th>
            <th class="text-right">
              {{ t('totalToLiquidate') }}
            </th>
            <th class="text-center">
              {{ t('status') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr class="cursor-pointer" v-for="(order, idx) in report.orders" :key="idx" @click="routerPush(order._id)">
            <td>
              {{ order.reference }}
            </td>
            <td>
              {{ order.sender_name }}
            </td>
            <td>
              {{ order.client_name }}
            </td>
            <td class="text-center">
              <q-chip square size="8pt" class="primary text-bold text-white"
                :class="order.cash_on_delivery ? 'bg-green' : 'bg-red-5'">{{ order.cash_on_delivery ? t('yes') :
                  t('no') }}</q-chip>
            </td>
            <td class="text-right">
              {{ utils.formatPrice(parseFloat(order.cash_amount.replace('.', ''))) }}
            </td>
            <td class="text-right">
              {{ utils.formatPrice(parseFloat(order.collected)) }}
            </td>
            <td class="text-right">
              {{ utils.formatPrice(order.order_price) }}
            </td>
            <td class="text-right text-red">
              {{ utils.formatPrice(order.comission) }}
            </td>
            <td class="text-right text-green">
              {{ utils.formatPrice(order.total_to_liquidate) }}
            </td>
            <td class="text-center">
              <q-chip square size="8pt" class="primary text-white text-bold chip-status"
                :class="[statusColor[order.status] || 'bg-purple-10']">
                <span>
                  {{ status[order.status] || order.status }}
                </span>
              </q-chip>
            </td>
          </tr>
          <div class="text-center q-pa-sm" v-if="report.orders?.length === 0">
            {{ t('noOrders') }}...
          </div>
        </tbody>
      </q-markup-table>
    </div>
    <!--End table-->
  </section>
</template>

<script setup>
// imports
import { date } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { Utils } from 'src/utils/utils';
import { onBeforeMount, ref } from 'vue';
import { notification } from 'src/boot/notification';
import { reportsContent } from 'src/composables/reportsContent';
import { useSendersStore } from 'src/stores/sendersStore';
// props
const props = defineProps({
  sender: String,
  dateNow: String,
});

// references
const report = ref({});
const { t } = useI18n();
const utils = new Utils();
const router = useRouter();
const content = reportsContent();
const sendersStore = useSendersStore();

const status = {
  pending: t('pending'),
  in_progress: t('in_progress'),
  delivered: t('delivered'),
  cancelled: t('cancelled'),
  returned: t('returned'),
  'guide-printed': t('guide_printed'),
  guide_news: t('guide_news'),
}

const statusColor = {
  pending: 'bg-yellow',
  in_progress: 'bg-primary',
  delivered: 'bg-blue-10',
  cancelled: 'bg-red',
  returned: 'bg-warning',
  'guide-printed': 'bg-green',
  guide_news: 'bg-warning',
}

// methods
const loadLiquidationReport = async () => {
  if (!props.sender) {
    notification('negative', t('senderRequired'), 'red');
    return;
  };

  let query = `from=${date.formatDate(props.dateNow.from || props.dateNow, 'YYYY/MM/DD')}&to=${date.formatDate(props.dateNow.to || props.dateNow, 'YYYY/MM/DD')}`;

  if (props.sender) {
    query += `&sender=${props.sender}`;
  }

  try {
    const { data } = await content.doLiquidateReport(query);
    if (data) {
      report.value = data;
    }
  } catch (error) {
    console.error(error);
  }
};

const routerPush = (e) => {
  router.push({
    path: `/dashboard/show/${e}/orders`
  });
}

// hook
onBeforeMount(async () => {
  await loadLiquidationReport();
});

onBeforeMount(() => {
  sendersStore.clearSenders();
});
</script>

<style scoped lang="scss">
.repartix-dashboard__cards {
  display: grid !important;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  width: 100%;

  @media(width < 992px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media(width < 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media(width < 500px) {
    grid-template-columns: repeat(1, 1fr);
  }
}

.q-card {
  flex: 1 !important;
}

.title {
  font-size: 1rem;
  font-weight: 600;
}

.value {
  font-size: .8rem;
  font-weight: 600;
  color: #fff;
  background: $primary;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .75rem;
}

.grid {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.value-amount {
  padding: .8rem;
  background: $primary;
  border-radius: .8rem;
  color: white;
  font-weight: 600;
  font-size: .75rem;
}
</style>
