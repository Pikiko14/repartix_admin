<template>
  <div class="header-title">
    <h2 class="text-primary page-title">
      {{ title }}
    </h2>
    <div class="header-actions">
      <q-input placeholder="####/##/## - ####/##/##" mask="####/##/## - ####/##/##" outlined dense v-model="dateLabel" v-if="showDatePicker">
        <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy ref="dateReference" cover transition-show="scale" transition-hide="scale">
            <q-date range  v-model="date">
              <div class="row items-center justify-end" v-if="date.from && date.to">
                <q-btn @click="clearDate" v-close-popup flat dense color="red" rounded icon-right="cleaning_services">
                  <q-tooltip class="bg-red">
                    {{ t('clear') }}
                  </q-tooltip>
                </q-btn>
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
      </q-input>
      
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
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { Utils } from 'src/utils/utils';
import { onBeforeMount, ref, watch } from 'vue';

// references
const route = useRoute();
const utils = new Utils();
const dateReference = ref();

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
  showDatePicker: {
    type: Boolean,
    default: false
  },
});

// emits
const emit = defineEmits(['add-new', 'do-search', 'filter-by-date']);

// references
const search = ref('');
const { t } = useI18n();
const dateLabel = ref('');
const date= ref({ from: '', to: '' });

// watch
watch(() => date.value, (val) => {
  if (!val) return;
  dateLabel.value = `${val?.from} - ${val?.to}`;
  if (dateReference.value) dateReference.value?.hide();
  emit('filter-by-date', val);
});


// methos
const handlerAddNew = () => {
  emit('add-new');
}

const handlerSeach = (e) => {
  emit('do-search', e);
}

const clearDate = () => {
  date.value = {
    from: '',
    to: '',
  }
  dateLabel.value = '';
  emit('filter-by-date', date.value);
}

// hooks
onBeforeMount(() => {
  if (route.query.search) {
    search.value = route.query.search;  
  }

  if (route.query.from && route.query.to) {
    date.value = {
      from: route.query.from,
      to: route.query.to,
    }
    dateLabel.value = `${route.query.from} - ${route.query.to}`;
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
