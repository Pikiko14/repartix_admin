<template>
  <q-table :selected-rows-label="getSelectedString" :selection="enableSelected ? 'multiple' : 'none'"
    v-model:selected="selecteds" @request="handlerPagination" :rows="rows" class="shadow-0" :columns="columns"
    row-key="_id" :pagination="pagination">
    <!--User type-->
    <template v-slot:body-cell-typeUser="props">
      <q-td :props="props">
        <q-chip dense class="bg-primary text-white">
          {{ typeUser[props.row.type_user] }}
        </q-chip>
      </q-td>
    </template>
    <!--End user type-->

    <!--email td-->
    <template v-slot:body-cell-email="props">
      <q-td :props="props">
        <a :href="`mailto:${props.row.email}`">{{ props.row.email }}</a>
      </q-td>
    </template>
    <!--End email td-->

    <!--phone td-->
    <template v-slot:body-cell-phone="props">
      <q-td :props="props">
        <a :href="`tel:${props.row.phone}`">{{ props.row.phone || props.row?.sender_info?.brand_phone ||
          props.row?.profile?.phone }}</a>
      </q-td>
    </template>
    <!--End phone td-->

    <!--status td-->
    <template v-slot:body-cell-status="props">
      <q-td :props="props">
        <q-chip square size="8pt" class="primary text-bold chip-status"
          :class="[statusColor[props.row.status] || 'bg-purple-10']">
          <span>
            {{ status[props.row.status] || props.row.status }}
          </span>
        </q-chip>
      </q-td>
    </template>
    <!--End status td-->

    <!--cash on delivery td-->
    <template v-slot:body-cell-cashOnDelivery="props">
      <q-td :props="props">
        <q-chip square size="8pt" class="primary text-bold text-white"
          :class="props.row.cash_on_delivery ? 'bg-green' : 'bg-red-5'">{{ props.row.cash_on_delivery ? t('yes') :
            t('no') }}</q-chip><br />
          <q-icon color="primary" size="1.5rem" name="currency_exchange" v-if="props.row.cash_on_delivery && props.row.settled_to_sender">
            <q-tooltip class="bg-primary">
              {{ t('liquidated') }}<br />
            </q-tooltip>
          </q-icon>
      </q-td>
    </template>
    <!--End cash on deliver td-->

    <!--Option td-->
    <template v-slot:body-cell-options="props">
      <q-td :props="props">
        <q-btn icon="apps" color="primary" rounded flat dense>
          <q-menu>
            <q-list bordered dense class="rounded-borders">
              <q-item :disable="typeof action.disable === 'function' ? action.disable(props.row) : false" v-close-popup v-for="(action, index) in actions" :key="index" v-show="action.condition(props.row)" clickable
                @click="action.emit(props.row)">
                <q-item-section class="text-bold text-primary">
                  {{ t(action.tooltip) }}
                </q-item-section>

                <q-item-section side>
                  <q-btn flat dense round :icon="action.icon" :color="action.color" :size="action.size || undefined">
                    <q-tooltip :class="`bg-${action.color}`">
                      {{ t(action.tooltip) }}
                    </q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>

          </q-menu>
        </q-btn>
      </q-td>
    </template>
    <!--End option td-->

    <!--relation delivered-->
    <template v-slot:body-cell-orderResume="props">
      <q-td :props="props">
        <q-slider disable v-model="props.row.orders_delivered" :min="0" :max="props?.row?.order_total"
          :step="props?.row?.orders_delivered" marker-labels color="primary" />
      </q-td>
    </template>
    <!--End relation delivered-->

    <!--Selection slot-->
    <template v-slot:header-selection="scope">
      <q-toggle color="primary" v-model="scope.selected" />
    </template>

    <template v-slot:body-selection="scope">
      <q-toggle color="primary" v-model="scope.selected" />
    </template>
    <!--End selection slot-->
  </q-table>
</template>

<script setup>
// import
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Utils } from 'src/utils/utils';
import { useRouter, useRoute } from 'vue-router';

// props
const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Array,
    default: () => [],
  },
  editScope: String,
  deleteScope: String,
  showOrderScope: String,
  showRouteScope: String,
  pagination: {
    type: Object,
    default: () => { }
  },
  enableSelected: {
    type: Boolean,
    default: false,
  },
  selectedIds: {
    type: Array,
    default: () => [],
  }
});

// emits
const emit = defineEmits([
  'edit',
  'delete',
  'handler-selected',
  'show-order',
  'show-route',
  'show-guide',
  'close-shipping'
]);

// references
const { t } = useI18n();
const route = useRoute();
const selecteds = ref([]);
const utils = new Utils();
const router = useRouter();
const typeUser = {
  employe: t('employe'),
  admin: t('admin'),
  sender: t('sender'),
  delivery: t('delivery'),
}

const status = {
  pending: t('pending'),
  in_progress: t('in_progress'),
  delivered: t('delivered'),
  cancelled: t('cancelled'),
  returned: t('returned'),
  'guide-printed': t('guide_printed'),
  guide_news: t('guide_news'),
}

const statusColor = {
  pending: 'bg-yellow',
  in_progress: 'bg-primary',
  delivered: 'bg-blue-10',
  cancelled: 'bg-red',
  returned: 'bg-warning',
  'guide-printed': 'bg-green',
  guide_news: 'bg-warning',
}

const actions = [
  {
    icon: 'visibility',
    color: 'primary',
    tooltip: 'showOrder',
    condition: () => utils.validateRole(props.showOrderScope),
    emit: (row) => emit('show-order', row._id)
  },
  {
    icon: 'map',
    color: 'primary',
    tooltip: 'viewRoute',
    condition: () => utils.validateRole(props.showRouteScope),
    emit: (row) => emit('show-route', row._id)
  },
  {
    icon: 'document_scanner',
    color: 'green',
    tooltip: 'guide',
    size: '10pt',
    condition: (row) => utils.validateRole(props.showOrderScope) && row.print_guide,
    emit: (row) => emit('show-guide', row.reference)
  },
  {
    icon: 'document_scanner',
    color: 'green',
    tooltip: 'guide',
    size: '10pt',
    condition: (row) =>
      utils.validateRole(props.showOrderScope) && row.courier && row.orders_delivered >= 0,
    emit: (row) => emit('show-guide', row._id)
  },
  {
    icon: 'close',
    color: 'orange',
    tooltip: 'close',
    size: '10pt',
    condition: (row) =>
      utils.validateRole(props.showOrderScope) &&
      row.courier &&
      row.orders_delivered >= 0 &&
      !row.is_close,
    emit: (row) => emit('close-shipping', row._id)
  },
  {
    icon: 'edit',
    color: 'blue',
    tooltip: 'edit',
    disable: (row) => row.status && row.status === 'delivered',
    condition: () => utils.validateRole(props.editScope),
    emit: (row) => emit('edit', row._id)
  },
  {
    icon: 'delete',
    color: 'red',
    tooltip: 'delete',
    disable: (row) => (row.status && row.status !== 'pending') || row.is_close,
    condition: () => utils.validateRole(props.deleteScope),
    emit: (row) => emit('delete', row._id)
  }
]

// watch
watch(() => selecteds.value, (newVal) => {
  emit('handler-selected', newVal);
});

watch(() => props.rows, (newRows) => {
  if (props.enableSelected && props.selectedIds.length > 0 && newRows.length > 0) {
    const rowsToSelect = newRows.filter(row => props.selectedIds.includes(row._id));
    if (rowsToSelect.length > 0) {
      selecteds.value = rowsToSelect;
    }
  }
}, { immediate: true });

// methods
const handlerPagination = (e) => {
  const { pagination } = e;

  const query = {
    page: pagination.page || 1,
    perPage: pagination.rowsPerPage,
    search: route.query.search || '',
  }

  if (route.query.from && route.query.to) {
    query.from = route.query.from;
    query.to = route.query.to;
  }

  if (route.query.filters) {
    query.filters = route.query.filters;
  }

  router.push({
    name: route.name,
    query
  });
}

const getSelectedString = () => {
  return selecteds.value.length === 0 ? '' : `${selecteds.value.length} record${selecteds.value.length > 1 ? 's' : ''} selected of ${props.rows.length}`
}
</script>

<style scoped lang="scss">
a {
  color: $primary;
  text-decoration: none;
  font-weight: 400;
}

.chip-status {
  width: 90px;
  color: white !important;

  span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 100%;
  }
}
</style>
