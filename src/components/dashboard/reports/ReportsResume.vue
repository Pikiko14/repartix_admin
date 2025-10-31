<template>
  <section class="row">
    <!--header-->
    <div class="col-12 col-md-5">
      <h2 class="text-primary page-title">
        <span v-if="$route.path === '/dashboard/reports/diary-order'">{{ t('diaryOder') }}</span>
        <span v-if="$route.path === '/dashboard/reports/order-liquidation'">{{ t('liquidationOrder') }}</span>
        <span v-if="$route.path === '/dashboard/reports/performance'">{{ t('performanceReport') || 'Reporte de Rendimiento' }}</span>
      </h2>
    </div>
    <div class="col-md-7">
      <section class="filters">
        <!--Courier filter-->
        <div class="filters__item"
          v-if="(route.path === '/dashboard/reports/diary-order' || route.path === '/dashboard/reports/performance') && route.query.type && route.query.type === 'courier'">
          <q-select clearable map-options emit-value @update:model-value="filterByCourier" :label="t('selectOneOption')"
            outlined round dense v-model="courier" :options="couriersOptions">
          </q-select>
        </div>
        <!--End courier filter-->

        <!--sender filter-->
        <div v-if="route.path === '/dashboard/reports/order-liquidation'" class="filters_item">
          <q-input @update:model-value="filterBySender" placeholder="Jhon Doe" debounce="1500" outlined dense
            v-model="senderSearch">
            <template #append>
              <q-icon name="store" />
            </template>
          </q-input>
          <q-menu fit v-model="menuSender" v-if="senders.length > 0">
            <q-list class="q-px-none" dense>
                <q-item class="q-px-none" tag="label" v-ripple v-for="(senderData, idx) in senders" :key="idx">
                  <q-item-section avatar>
                    <q-radio @update:model-value="setSender" v-model="sender" :val="senderData.value" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="address-label">{{ senderData?.label }}</q-item-label>
                    <q-item-label caption>{{ senderData?.phone }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
          </q-menu>
        </div>
        <!--End sender filter-->

        <!--Date filter-->
        <div class="filters__item date-filter-container">
          <q-input @click="dateReference.toggle()" placeholder="####/##/##" outlined dense
            v-model="dateLabel">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy ref="dateReference" cover transition-show="scale" transition-hide="scale">
                  <q-date :range="route.path === '/dashboard/reports/order-liquidation' || route.path === '/dashboard/reports/performance'" @update:model-value="filterByDate" v-model="dateNow">
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <!--Generate PDF Button-->
        <div class="filters__item pdf-button-container">
          <q-btn 
            unelevated
            rounded
            color="primary" 
            icon="picture_as_pdf" 
            :label="t('generatePdf')"
            :loading="generatingPdf"
            @click="handleGeneratePdf"
          />
        </div>
        <!--End date filter-->
      </section>
    </div>
    <!--End header-->

    <!--body-->
    <DiaryReport :courier="courier" :date-now="dateNow"
      v-if="route.path === '/dashboard/reports/diary-order' && render" />
    <LiquidationReport :dateNow="dateNow" :sender="sender"
      v-if="route.path === '/dashboard/reports/order-liquidation' && render" />
    <PerformanceReport :date-now="dateNow" :courier="courier"
      v-if="route.path === '/dashboard/reports/performance' && render" />
    <!--end body-->
  </section>
</template>

<script setup>
// imports
import { date, Loading } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { ref, nextTick, onBeforeMount, computed } from 'vue';
import DiaryReport from './components/DiaryReport.vue';
import { sendersContent } from 'src/composables/sendersContent';
import { couriersContent } from 'src/composables/couriersContent';
import LiquidationReport from './components/LiquidationReport.vue';
import PerformanceReport from './components/PerformanceReport.vue';
import { useSendersStore } from 'src/stores/sendersStore';
import { reportsContent } from 'src/composables/reportsContent';
import { notification } from 'src/boot/notification';

// references
const sender = ref(null);
const courier = ref('');
const { t } = useI18n();
const render = ref(true);
const route = useRoute();
const dateLabel = ref('');
const dateReference = ref();
const senderSearch = ref('');
const menuSender = ref(false);
const couriersOptions = ref([]);
const sendersStore = useSendersStore();
const senderContent = sendersContent();
const courierContent = couriersContent();
const reportsContentService = reportsContent();
const dateNow = ref(date.formatDate(new Date(), 'YYYY/MM/DD'));
const generatingPdf = ref(false);

// computed
const senders = computed(() => {
  return sendersStore.getSenders.map((el) => {
    return {
      value: el.sender_info.brand_name,
      label: el.sender_info.brand_name,
      phone: el.sender_info.brand_phone,
    }
  });
});

// methods
const filterByDate = async (val) => {
  dateNow.value = val;
  dateReference.value?.hide();
  dateLabel.value = `${val?.from || val} - ${val?.to || val}`;
  render.value = false;
  await nextTick();
  render.value = true;
}

const filterByCourier = async (val) => {
  courier.value = val;
  render.value = false;
  await nextTick();
  render.value = true;
}

const filterBySender = async (val) => {
  try {
    Loading.show();
    await senderContent.doListSenders(`page=1&perPage=10&search=${val}`);
    if (senders.value.length > 0) {
      menuSender.value = true;
    }
  } finally {
    Loading.hide();
  }
}

const setSender = async (e) => {
  sender.value = e;
  senderSearch.value = e;
  render.value = false;
  menuSender.value = false;
  await nextTick();
  render.value = true;
}

const handleGeneratePdf = async () => {
  generatingPdf.value = true;
  try {
    let payload = {};

    if (route.path === '/dashboard/reports/diary-order') {
      // Validar que se tenga la fecha
      if (!dateNow.value) {
        notification('negative', t('dateRequired'), 'red');
        generatingPdf.value = false;
        return;
      }

      payload = {
        report_type: 'diary',
        date: dateNow.value,
      };

      if (route.query.type && route.query.type === 'courier' && courier.value) {
        payload.courier = courier.value;
      }
    } else if (route.path === '/dashboard/reports/performance') {
      // Validar que se tenga la fecha
      if (!dateNow.value) {
        notification('negative', t('dateRequired'), 'red');
        generatingPdf.value = false;
        return;
      }

      payload = {
        report_type: 'performance',
      };

      if (typeof dateNow.value === 'object' && dateNow.value.from && dateNow.value.to) {
        payload.from = dateNow.value.from;
        payload.to = dateNow.value.to;
      } else {
        payload.from = dateNow.value;
        payload.to = dateNow.value;
      }

      if (route.query.type && route.query.type === 'courier' && courier.value) {
        payload.courier = courier.value;
      }
    } else if (route.path === '/dashboard/reports/order-liquidation') {
      // Validar que se tenga el sender
      if (!sender.value) {
        notification('negative', t('senderRequired'), 'red');
        generatingPdf.value = false;
        return;
      }

      payload = {
        report_type: 'liquidation',
        sender: sender.value,
        from: dateNow.value?.from || dateNow.value,
        to: dateNow.value?.to || dateNow.value,
      };
    } else {
      notification('negative', t('invalidReportType'), 'red');
      generatingPdf.value = false;
      return;
    }

    const response = await reportsContentService.doGenerateReportPdf(payload);
    
    if (response && response.success) {
      notification('positive', t('pdfGenerationStarted'), 'primary');
    } else {
      notification('negative', t('errorGeneratingPdf'), 'red');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    notification('negative', t('errorGeneratingPdf'), 'red');
  } finally {
    generatingPdf.value = false;
  }
};

// hook
onBeforeMount(async () => {
  if (route.query.type && route.query.type === 'courier' && (route.path === '/dashboard/reports/diary-order' || route.path === '/dashboard/reports/performance')) {
    const data = await courierContent.doListCourierForSelect();
    if (data && data.success) {
      couriersOptions.value = data.couriers.map((el) => {
        return {
          label: el.name,
          value: el.name,
        }
      });
    }
  };
});
</script>

<style scoped lang="scss">
.filters {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;

  &__item {
    width: 25%;

    &.date-filter-container {
      width: auto;
      min-width: 200px;
    }

    &.pdf-button-container {
      width: auto;
      flex-shrink: 0;
    }
  }
}
</style>
