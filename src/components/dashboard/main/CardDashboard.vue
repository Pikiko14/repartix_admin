<template>
  <div class="repartix-dashboard__cards">
    <q-card class="shadow-0">
      <q-card-section class="grid">
        <p class="title text-primary">
          Domicilios:
        </p>
        <p class="value">
          <AnimatedCounter v-if="counters.totalOrders" :value="counters.totalOrders || 0" :duration="500" class="counter"/>
          <span v-else>0</span>
        </p>
      </q-card-section>
    </q-card>

    <q-card class="shadow-0">
      <q-card-section class="grid">
        <p class="title text-primary">
          Entregados:
        </p>
        <p class="value">
          <AnimatedCounter v-if="counters.delivered" :value="counters.delivered || 0" :duration="500" class="counter"/>
          <span v-else>0</span>
        </p>
      </q-card-section>
    </q-card>

    <q-card class="shadow-0">
      <q-card-section class="grid">
        <p class="title text-primary">
          Pendientes:
        </p>
        <p class="value">
          <AnimatedCounter v-if="counters.pending" :value="counters.pending || 0" :duration="500" class="counter"/>
          <span v-else>0</span>
        </p>
      </q-card-section>
    </q-card>

    <q-card class="shadow-0">
      <q-card-section class="grid">
        <p class="title text-primary">
          Cancelados:
        </p>
        <p class="value">
          <AnimatedCounter v-if="counters.cancelled" :value="counters.cancelled || 0" :duration="500" class="counter"/>
          <span v-else>0</span>
        </p>
      </q-card-section>
    </q-card>

    <q-card class="shadow-0">
      <q-card-section class="grid">
        <p class="title text-primary">
          Novedades:
        </p>
        <p class="value">
          <AnimatedCounter v-if="counters.news" :value="counters.news || 0" :duration="500" class="counter"/>
          <span v-else>0</span>
        </p>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
// imports
import { computed } from 'vue';
import { useDashboardStore } from 'src/stores/dashboardStore.js';

// references
const store = useDashboardStore();

// computed
const counters = computed(() => store.counters);

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
}

.grid {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
