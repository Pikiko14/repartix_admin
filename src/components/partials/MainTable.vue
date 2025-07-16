<template>
  <q-table
    :rows="rows"
    class="shadow-0"
    :columns="columns"
    row-key="_id"
  >
    <template v-slot:body-cell-options="props">
      <q-td :props="props">
        {{ props }}
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
// props
defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Array,
    default: () => [],
  },
});
</script>
