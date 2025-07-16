<template>
  <q-card class="modal-card">
    <q-card-section class="modal-card__header">
      <h3 class="text-primary">
        {{ title }}
      </h3>
      <q-btn v-close-popup icon="close" flat dense rounded color="red"></q-btn>
    </q-card-section>

    <q-card-section style="margin-top: -20px">
      <slot name="body"></slot>
    </q-card-section>
  </q-card>
</template>

<script setup>
// props
defineProps({
  title: {
    type: String,
    default: () => '',
  }
});
</script>

<style scoped lang="scss">
.modal-card {
  width: 460px;
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      font-size: 1.5rem;
      font-weight: 600;
    }

    .q-btn {
      width: 40px;
      height: 40px;
    }
  }
}
</style>
