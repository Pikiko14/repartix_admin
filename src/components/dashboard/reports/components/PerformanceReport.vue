<template>
  <div class="col-12 row">
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
            {{ t('delivered') }}:
          </p>
          <p class="value">
            <AnimatedCounter v-if="report.deliveredOrders" :value="report.deliveredOrders || 0" :duration="500" class="counter" />
            <span v-else>0</span>
          </p>
        </q-card-section>
      </q-card>

      <q-card class="shadow-0">
        <q-card-section class="grid">
          <p class="title text-primary">
            {{ t('averageDeliveryTime') || 'Tiempo de entrega' }}:
          </p>
          <p class="value-time">
            <span v-if="report.averageDeliveryTimeHours !== undefined">
              {{ report.averageDeliveryTimeHours }}h {{ report.averageDeliveryTimeMinutes }}m
            </span>
            <span v-else>0h 0m</span>
          </p>
        </q-card-section>
      </q-card>

      <q-card class="shadow-0">
        <q-card-section class="grid">
          <p class="title text-primary">
            {{ t('efficiency') || 'Eficiencia' }}:
          </p>
          <p class="value-efficiency">
            <span v-if="report.efficiency !== undefined">
              {{ report.efficiency.toFixed(1) }}%
            </span>
            <span v-else>0%</span>
          </p>
        </q-card-section>
      </q-card>

      <q-card class="shadow-0">
        <q-card-section class="grid">
          <p class="title text-primary">
            {{ t('assignedRoutes') || 'Rutas asignadas' }}:
          </p>
          <p class="value">
            <AnimatedCounter v-if="report.assignedRoutes" :value="report.assignedRoutes || 0" :duration="500" class="counter" />
            <span v-else>0</span>
          </p>
        </q-card-section>
      </q-card>
    </div>
    <!--End counter-->

    <!--Performance by Vehicle Type-->
    <div class="col-12 q-mt-lg">
      <q-card class="shadow-0">
        <q-card-section>
          <h3 class="text-primary q-mb-md">{{ t('performanceByVehicleType') || 'Rendimiento por tipo de vehículo' }}</h3>
          <q-markup-table flat class="shadow-0">
            <thead>
              <tr>
                <th class="text-left">{{ t('vehicleType') || 'Tipo de vehículo' }}</th>
                <th class="text-center">{{ t('total') || 'Total' }}</th>
                <th class="text-center">{{ t('delivered') }}</th>
                <th class="text-center">{{ t('efficiency') || 'Eficiencia' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(perf, idx) in report.performanceByVehicle" :key="idx">
                <td>{{ perf.vehicle_type || t('notAssigned') || 'Sin asignar' }}</td>
                <td class="text-center">{{ perf.total || 0 }}</td>
                <td class="text-center">{{ perf.delivered || 0 }}</td>
                <td class="text-center">{{ perf.efficiency ? perf.efficiency.toFixed(1) : '0' }}%</td>
              </tr>
              <tr v-if="!report.performanceByVehicle || (Array.isArray(report.performanceByVehicle) && report.performanceByVehicle.length === 0)">
                <td colspan="4" class="text-center text-grey">
                  {{ t('noData') || 'No hay datos disponibles' }}
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
      </q-card>
    </div>
    <!--End Performance by Vehicle Type-->
  </div>
</template>

<script setup>
// imports
import { date } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { onBeforeMount, ref, watch } from 'vue';
import { notification } from 'src/boot/notification';
import { reportsContent } from 'src/composables/reportsContent';

// props
const props = defineProps({
  dateNow: String,
  courier: String,
});

//references
const report = ref({
  totalOrders: 0,
  deliveredOrders: 0,
  averageDeliveryTime: 0,
  averageDeliveryTimeHours: 0,
  averageDeliveryTimeMinutes: 0,
  efficiency: 0,
  assignedRoutes: 0,
  performanceByVehicle: []
});
const { t } = useI18n();
const route = useRoute();
const content = reportsContent();

// methods
const loadPerformanceReport = async () => {
  if (route.query.type && route.query.type === 'courier' && !props.courier) {
    notification('negative', t('courierRequired'), 'red');
    return;
  };

  let query = '';
  
  if (props.dateNow) {
    if (typeof props.dateNow === 'object' && props.dateNow.from && props.dateNow.to) {
      query = `from=${date.formatDate(props.dateNow.from, 'YYYY/MM/DD')}&to=${date.formatDate(props.dateNow.to, 'YYYY/MM/DD')}`;
    } else if (props.dateNow) {
      query = `from=${date.formatDate(props.dateNow, 'YYYY/MM/DD')}&to=${date.formatDate(props.dateNow, 'YYYY/MM/DD')}`;
    }
  }

  if (props.courier) {
    if (query) {
      query += `&courier=${encodeURIComponent(props.courier)}`;
    } else {
      query = `courier=${encodeURIComponent(props.courier)}`;
    }
  }

  try {
    const response = await content.doGetPerformanceReport(query);
    console.log('Performance Report Response:', response);
    
    // El backend retorna { success: true, data: {...}, message: '...' }
    if (response && response.success && response.data) {
      report.value = response.data;
      console.log('Report data set:', report.value);
    } else if (response && response.data) {
      // Si la respuesta ya viene con data directamente
      report.value = response.data;
    } else if (response && Array.isArray(response.performanceByVehicle)) {
      // Si la respuesta es directamente los datos
      report.value = response;
    } else {
      console.warn('Unexpected response format:', response);
    }
  } catch (error) {
    console.error('Error loading performance report:', error);
    // Reinicializar con valores por defecto en caso de error
    report.value = {
      totalOrders: 0,
      deliveredOrders: 0,
      averageDeliveryTime: 0,
      averageDeliveryTimeHours: 0,
      averageDeliveryTimeMinutes: 0,
      efficiency: 0,
      assignedRoutes: 0,
      performanceByVehicle: []
    };
  }
};

// watch props changes
watch(() => [props.dateNow, props.courier], async () => {
  await loadPerformanceReport();
}, { deep: true });

// hook
onBeforeMount(async () => {
  await loadPerformanceReport();
});
</script>

<style lang="scss" scoped>
.repartix-dashboard__cards {
  display: grid !important;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  width: 100%;

  @media(width < 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

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

.value-time {
  font-size: .9rem;
  font-weight: 600;
  color: #fff;
  background: $primary;
  border-radius: .8rem;
  padding: .8rem;
  text-align: center;
}

.value-efficiency {
  font-size: .9rem;
  font-weight: 600;
  color: #fff;
  background: $primary;
  border-radius: .8rem;
  padding: .8rem;
  text-align: center;
}

.grid {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h3 {
  font-size: 1.5rem;
  font-weight: 600;
}
</style>

