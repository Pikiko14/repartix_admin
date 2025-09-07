<template>
  <div class="col-12">
    <!--Counter-->
    <div class="repartix-dashboard__cards">
      <q-card class="shadow-0">
        <q-card-section class="grid">
          <p class="title text-primary">
            {{ t('orders') }}:
          </p>
          <p class="value">
            <AnimatedCounter v-if="report.totalOrders" :value="report.totalOrders || 0" :duration="500"
              class="counter" />
            <span v-else>0</span>
          </p>
        </q-card-section>
      </q-card>

      <q-card class="shadow-0">
        <q-card-section class="grid">
          <p class="title text-primary">
            {{ t('delivered') }}s:
          </p>
          <p class="value">
            <AnimatedCounter v-if="report.delivared" :value="report.delivared || 0" :duration="500" class="counter" />
            <span v-else>0</span>
          </p>
        </q-card-section>
      </q-card>

      <q-card class="shadow-0">
        <q-card-section class="grid">
          <p class="title text-primary">
            {{ t('printed') }}:
          </p>
          <p class="value">
            <AnimatedCounter v-if="report.printed" :value="report.printed || 0" :duration="500" class="counter" />
            <span v-else>0</span>
          </p>
        </q-card-section>
      </q-card>

      <q-card class="shadow-0">
        <q-card-section class="grid">
          <p class="title text-primary">
            {{ t('pending') }}s:
          </p>
          <p class="value">
            <AnimatedCounter v-if="report.pending" :value="report.pending || 0" :duration="500" class="counter" />
            <span v-else>0</span>
          </p>
        </q-card-section>
      </q-card>

      <q-card class="shadow-0">
        <q-card-section class="grid">
          <p class="title text-primary">
            {{ t('cancelled') }}s:
          </p>
          <p class="value">
            <AnimatedCounter v-if="report.cancelled" :value="report.cancelled || 0" :duration="500" class="counter" />
            <span v-else>0</span>
          </p>
        </q-card-section>
      </q-card>

      <q-card class="shadow-0">
        <q-card-section class="grid">
          <p class="title text-primary">
            {{ t('guide_news') }}:
          </p>
          <p class="value">
            <AnimatedCounter v-if="report.news" :value="report.news || 0" :duration="500" class="counter" />
            <span v-else>0</span>
          </p>
        </q-card-section>
      </q-card>
    </div>
    <!--End counter-->

    <!--efectiveness ratio-->
    <div class="col-12 q-mt-lg"
      v-if="route.query.methods && route.query.methods === 'effectiveness-ratio' && renderChart">
      <q-card class="shadow-0">
        <q-card-section>
          <div class="row">
            <div class="col-12 col-md-6">
              <span class="title">{{ t('relationDelivered') }}</span>
              <apexchart width="100%" height="350px" type="pie" :options="options" :series="series"></apexchart>
            </div>
            <div class="col-12 col-md-6">
              <span class="title">{{ t('relationStatus') }}</span>
              <apexchart width="100%" height="350px" type="pie" :options="optionsRelationStatus" :series="seriesRelationStatus"></apexchart>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <!--End efectiveness ratio-->

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
              {{ t('priceDelivery') }}
            </th>
            <th class="text-center">
              {{ t('status') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(order, idx) in report.orders" :key="idx">
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
              {{ utils.formatPrice(order.order_price) }}
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
          <div class="text-center" v-if="report.orders?.length === 0">
            <td class="text-center">
              {{ t('noOrders') }}...
            </td>
          </div>
        </tbody>
      </q-markup-table>
    </div>
    <!--End table-->
  </div>
</template>

<script setup>
// imports
import { date } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { Utils } from 'src/utils/utils';
import { nextTick, onBeforeMount, ref } from 'vue';
import { notification } from 'src/boot/notification';
import { reportsContent } from 'src/composables/reportsContent';
// props
const props = defineProps({
  dateNow: String,
  courier: String,
});

//references
const report = ref({});
const { t } = useI18n();
const render = ref(true);
const route = useRoute();
const utils = new Utils();
const renderChart = ref(false);
const content = reportsContent();

const options = ref({
  labels: [t('delivered'), t('pending')],
});
const series = ref([0, 0]);

const optionsRelationStatus = ref({
  labels: [t('delivered'), t('pending'), t('cancelled'), t('guide_news'), t('printed')],
});
const seriesRelationStatus = ref([0, 0]);

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
const loadDiaryReport = async () => {
  if (route.query.type && route.query.type === 'courier' && !props.courier) {
    notification('negative', t('courierRequired'), 'red');
    return;
  };

  let query = `date=${date.formatDate(props.dateNow, 'YYYY/MM/DD')}`;

  if (props.courier) {
    query += `&courier=${props.courier}`;
  }

  try {
    const { data } = await content.doGetDiaryReport(query);
    if (data) {
      report.value = data;
      render.value = false;
      if (route.query.methods && route.query.methods === 'effectiveness-ratio')  renderChart.value = false;

      nextTick(() => {
        render.value = false;
        console.log(data)

        // validate efectivenes ratio
        if (route.query.methods && route.query.methods === 'effectiveness-ratio' && data.orders.length > 0) {;
          series.value = [report.value.delivared, (data.totalOrders -data.delivared )];
          seriesRelationStatus.value = [report.value.delivared, report.value.pending, report.value.cancelled, report.value.news, report.value.printed];
          renderChart.value = true;
        };
      });
    }
  } catch (error) {
    console.error(error);
  }
};

// hook
onBeforeMount(async () => {
  await loadDiaryReport();
});
</script>

<style lang="scss" scoped>
.repartix-dashboard__cards {
  display: grid !important;
  grid-template-columns: repeat(6, 1fr);
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
}

.grid {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>