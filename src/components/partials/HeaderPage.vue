<template>
  <div class="header-title">
    <h2 class="text-primary page-title">
      {{ title }}
    </h2>

    <div class="header-actions">
      <q-input @click="dateReference.toggle()" placeholder="####/##/## - ####/##/##" mask="####/##/## - ####/##/##"
        outlined dense v-model="dateLabel" v-if="showDatePicker">
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="dateReference" cover transition-show="scale" transition-hide="scale">
              <q-date range v-model="date">
                <div class="row items-center justify-end">
                  <q-btn @click="clearDate" v-close-popup flat dense color="red" :label="t('close')">
                    <q-tooltip class="bg-red">
                      {{ t('close') }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn v-if="date.from && date.to" @click="clearDate" :label="t('clear')" v-close-popup flat dense
                    color="warning">
                    <q-tooltip class="bg-warning">
                      {{ t('clear') }}
                    </q-tooltip>
                  </q-btn>
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <div class="filters-container" v-if="showFilters && filterItems.length > 0">
        <span v-if="Object.keys(filtersSelected).length === 0">
          {{ t('filters') }}
        </span>
        <span v-else class="filters-container__actives">
          {{ Object.keys(filtersSelected).length }} {{ t('actives') }}
        </span>

        <q-icon size=".9rem" name="filter_alt" color="primary"></q-icon>

        <q-menu fit>
          <q-list style="min-width: 100px">
            <q-item v-ripple clickable v-for="(item, idx) in filterItems" :key="idx" :class="{ 'active': Object.keys(filtersSelected).includes(item.key) }">
              <q-item-section>
                <q-item-label class="text-bold text-primary">{{ item.label }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="keyboard_arrow_right" size="xs" />
              </q-item-section>
              <q-menu anchor="top end" self="top start">
                <q-list>
                  <q-item :class="{ 'active': filtersSelected[item.key] === filter.value }" dense v-close-popup @click="doFilter(item.key, filter.value)" clickable v-ripple
                    v-for="(filter, idx) in item.items" :key="idx">
                    <q-item-section>
                      <q-item-label class="text-bold text-primary">{{ filter.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>
            <q-item clickable @click="clearFilter" v-ripple>
              <q-item-section>
                <q-item-label class="text-bold text-primary">{{ t('clear') }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon size="xs" name="cleaning_services" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>

      <q-input @update:model-value="handlerSeach" debounce="1500" v-model="search" dense outlined clearable
        :placeholder="t('search')">
        <template #append>
          <q-icon name="search"></q-icon>
        </template>
      </q-input>

      <q-btn v-if="showAddButton && utils.validateRole(scope)" @click="handlerAddNew" unelevated="" size="md"
        color="primary" rounded :label="t('add')"></q-btn>
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
const filtersSelected = ref({});

// props
const props = defineProps({
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
  showFilters: {
    type: Boolean,
    default: false,
  },
  filterItems: {
    type: Array,
    default: () => []
  }
});

// emits
const emit = defineEmits(['add-new', 'do-search', 'filter-by-date', 'do-filter']);

// references
const search = ref('');
const { t } = useI18n();
const dateLabel = ref('');
const date = ref({ from: '', to: '' });

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

const doFilter = (key, value) => {
  emit('do-filter', { key, value });
}

const clearFilter = () => {
  filtersSelected.value = {};
  emit('clear-filter');
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

  if (props.showFilters && route.query.filters) {
    filtersSelected.value = JSON.parse(route.query.filters);
  }
});
</script>

<style lang="scss" scoped>
.header-title {
  display: flex;
  justify-content: space-between;

  @media(max-width: 768px) {
    flex-direction: column;
    gap: 0;
  }
}

.q-btn {
  height: 40px;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;

  @media(max-width: 768px) {
    flex-direction: column;

    .q-input,
    .q-btn {
      width: 100%;
    }
  }
}

.filters-container {
  width: 190px;
  border: 1px solid rgba(0, 0, 0, 0.24);
  transition: border-color 0.36s cubic-bezier(0.4, 0, 0.2, 1);
  height: 40px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  justify-content: space-between;
  padding: 0 12px;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.87);

  span {
    font-size: .9rem;
  }

  &:hover {
    border-color: $primary;
  }

  &:active {
    border-color: $primary;
  }

  &__actives {
    display: inline-flex;
    align-items: center;
  }
}
</style>
