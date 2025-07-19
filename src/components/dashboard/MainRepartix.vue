<template>
  <section class="repartix-dashboard">
    <!--Card metrics-->
    <CardDashboard />
    <!--Card metrics-->

    <!--Mapa-->
    <MapDashboard />
    <!--End mapa-->
  </section>
</template>

<script setup>
// imports
import MapDashboard from './main/MapDashboard.vue';
import CardDashboard from './main/CardDashboard.vue';
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
</style>
