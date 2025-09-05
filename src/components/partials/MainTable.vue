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
            t('no') }}</q-chip>
      </q-td>
    </template>
    <!--End cash on deliver td-->

    <!--Option td-->
    <template v-slot:body-cell-options="props">
      <q-td :props="props">
        <q-btn @click="emit('show-order', props.row._id)" v-if="utils.validateRole(showOrderScope)" icon="visibility"
          flat dense rounded color="primary">
          <q-tooltip class="bg-primary">
            {{ t('showOrder') }}
          </q-tooltip>
        </q-btn>
        <q-btn size="10pt" @click="emit('show-guide', props.row.reference)"
          v-if="utils.validateRole(showOrderScope) && props.row.print_guide" icon="document_scanner" flat dense rounded
          color="green">
          <q-tooltip class="bg-green">
            {{ t('guide') }}
          </q-tooltip>
        </q-btn>
        <q-btn size="10pt" @click="emit('show-guide', props.row._id)"
          v-if="utils.validateRole(showOrderScope) && props.row.courier" icon="document_scanner" flat dense rounded
          color="green">
          <q-tooltip class="bg-green">
            {{ t('guide') }}
          </q-tooltip>
        </q-btn>
        <q-btn :disable="props.row.status && props.row.status === 'delivered'" @click="emit('edit', props.row._id)"
          v-if="utils.validateRole(editScope)" icon="edit" flat dense rounded color="blue">
          <q-tooltip class="bg-blue">
            {{ t('edit') }}
          </q-tooltip>
        </q-btn>
        <q-btn :disabled="props.row.status && props.row.status !== 'pending' || props.row.is_close" @click="emit('delete', props.row._id)"
          v-if="utils.validateRole(deleteScope)" icon="delete" flat dense rounded color="red">
          <q-tooltip class="bg-red">
            {{ t('delete') }}
          </q-tooltip>
        </q-btn>
      </q-td>
    </template>
    <!--End option td-->

    <!--relation delivered-->
    <template v-slot:body-cell-orderResume="props">
      <q-td :props="props">
        <q-slider
          disable
          v-model="props.row.orders_delivered"
          :min="0"
          :max="props?.row?.order_total"
          :step="props?.row?.orders_delivered"
          marker-labels
          color="primary"
        />
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
  pagination: {
    type: Object,
    default: () => { }
  },
  enableSelected: {
    type: Boolean,
    default: false,
  }
});

// emits
const emit = defineEmits(['edit', 'delete', 'handler-selected', 'show-order']);

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

// watch
watch(() => selecteds.value, (newVal) => {
  emit('handler-selected', newVal);
});

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
