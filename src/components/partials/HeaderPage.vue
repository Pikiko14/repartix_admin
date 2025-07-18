<template>
  <div class="header-title">
    <h2 class="text-primary page-title">
      {{ title }}
    </h2>
    <q-btn v-if="showAddButton && utils.validateRole(scope)" @click="handlerAddNew" unelevated="" size="md" color="primary" rounded :label="t('add')"></q-btn>
  </div>
</template>

<script setup>
// imports
import { useI18n } from 'vue-i18n';
import { Utils } from 'src/utils/utils';

// references
const utils = new Utils();

// props
defineProps({
  title: {
    type: String,
    default: '',
  },
  showAddButton: {
    type: Boolean,
    default: false
  },
  scope: String,
});

// emits
const emit = defineEmits(['add-new']);

// references
const { t } = useI18n();

// methos
const handlerAddNew = () => {
  emit('add-new');
}
</script>

<style lang="scss" scoped>
.header-title {
  display: flex;
  justify-content: space-between;
}

.q-btn {
  height: 40px;
}
</style>
