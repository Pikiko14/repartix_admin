<template>
  <section class="repartix-dashboard">
    <div class="col-12">
      <h2 class="text-h6">
        {{ t('titleDashboard') }} {{ dateSelected || date.formatDate(now, 'DD/MM/YYYY') }}
        <q-btn icon="calendar_month" flat dense rounded color="primary">
          <q-popup-proxy ref="updateProxy" @before-show="updateProxy" cover transition-show="scale" transition-hide="scale">
            <q-date @update:model-value="filterByDate" v-model="dateSelected">
            </q-date>
          </q-popup-proxy>
          <q-tooltip class="bg-primary">
            {{ t('selectDate') }}
          </q-tooltip>
        </q-btn>
      </h2>
    </div>

    <!--Card metrics-->
    <CardDashboard v-if="render" />
    <!--Card metrics-->

    <!--Mapa-->
    <MapDashboard />
    <!--End mapa-->
  </section>
</template>

<script setup>
// imports
import { ref } from 'vue';
import { date } from 'quasar';
import { useI18n } from 'vue-i18n';
import MapDashboard from './main/MapDashboard.vue';
import CardDashboard from './main/CardDashboard.vue';
import { dashboardContent } from 'src/composables/dashboardContent';

// references
const now = new Date();
const { t } = useI18n();
const updateProxy = ref();
const render = ref(true);
const dateSelected = ref('');
const content = dashboardContent();

// methods
const loadDashboardData = async () => {
  const from = dateSelected.value || date.formatDate(now, 'YYYY/MM/DD');
  const to = dateSelected.value || date.formatDate(now, 'YYYY/MM/DD');
  if (updateProxy.value) updateProxy.value.hide();
  await content.doListDashboardData(`from=${from}&to=${to}`);
  render.value = false;
  setTimeout(() => 
    render.value = true, 
  0)
}

const filterByDate = (e) => {
  dateSelected.value = e;
  loadDashboardData();
}

// hook
loadDashboardData();
</script>

<style lang="scss" scoped>
.repartix-dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;

  &__cards {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    width: 100%;
  }
}

h2 {
  margin: 0px;
  line-height: 1rem;
  display: flex;
  align-items: center;
  gap: .5rem;
}
</style>
