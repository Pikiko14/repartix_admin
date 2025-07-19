<template>
  <div class="repartix-dashboard__cards">
    <q-card class="shadow-0">
      <q-card-section class="grid">
        <p class="title text-primary">
          Domicilios:
        </p>
        <p class="value">
          150
        </p>
      </q-card-section>
    </q-card>

    <q-card class="shadow-0">
      <q-card-section class="grid">
        <p class="title text-primary">
          Entregados:
        </p>
        <p class="value">
          140
        </p>
      </q-card-section>
    </q-card>

    <q-card class="shadow-0">
      <q-card-section class="grid">
        <p class="title text-primary">
          Pendientes:
        </p>
        <p class="value">
          3
        </p>
      </q-card-section>
    </q-card>

    <q-card class="shadow-0">
      <q-card-section class="grid">
        <p class="title text-primary">
          Cancelados:
        </p>
        <p class="value">
          4
        </p>
      </q-card-section>
    </q-card>

    <q-card class="shadow-0">
      <q-card-section class="grid">
        <p class="title text-primary">
          Reprogramados:
        </p>
        <p class="value">
          3
        </p>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
//
</script>

<style scoped lang="scss">
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
