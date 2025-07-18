<template>
  <div class="header-title">
    <h2 class="text-primary page-title">
      {{ title }}
    </h2>
    <div class="header-actions">
      <q-input @update:model-value="handlerSeach" debounce="1500" v-model="search" dense outlined clearable :placeholder="t('search')">
        <template #append>
          <q-icon name="search"></q-icon>
        </template>
      </q-input>
    <q-btn v-if="showAddButton && utils.validateRole(scope)" @click="handlerAddNew" unelevated="" size="md" color="primary" rounded :label="t('add')"></q-btn>
    </div>
  </div>
</template>

<script setup>
// imports
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { Utils } from 'src/utils/utils';

// references
const route = useRoute();
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
const emit = defineEmits(['add-new', 'do-search']);

// references
const search = ref('');
const { t } = useI18n();

// methos
const handlerAddNew = () => {
  emit('add-new');
}

const handlerSeach = (e) => {
  emit('do-search', e);
}

// hooks
onBeforeMount(() => {
  if (route.query.search) {
    search.value = route.query.search;  
  }
});
</script>

<style lang="scss" scoped>
.header-title {
  display: flex;
  justify-content: space-between;
}

.q-btn {
  height: 40px;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}
</style>
