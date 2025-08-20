<template>
  <q-table @request="handlerPagination" :rows="rows" class="shadow-0" :columns="columns" row-key="_id"
    :pagination="pagination">
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
        <q-chip square size="8pt" class="primary text-bold" :class="[statusColor[props.row.status]]">{{
          status[props.row.status] }}</q-chip>
      </q-td>
    </template>
    <!--End status td-->

    <!--status td-->
    <template v-slot:body-cell-cashOnDelivery="props">
      <q-td :props="props">
        <q-chip square size="8pt" class="primary text-bold text-primary"
          :class="props.row.cash_on_delivery ? 'bg-green' : 'bg-red-5'">{{ props.row.cash_on_delivery ? t('yes') :
            t('no') }}</q-chip>
      </q-td>
    </template>
    <!--End status td-->

    <!--Option td-->
    <template v-slot:body-cell-options="props">
      <q-td :props="props">
        <q-btn @click="emit('edit', props.row._id)" v-if="utils.validateRole(editScope)" icon="edit" flat dense rounded
          color="primary">
          <q-tooltip class="bg-primary">
            {{ t('edit') }}
          </q-tooltip>
        </q-btn>
        <q-btn @click="emit('delete', props.row._id)" v-if="utils.validateRole(deleteScope)" icon="delete" flat dense
          rounded color="red">
          <q-tooltip class="bg-red">
            {{ t('delete') }}
          </q-tooltip>
        </q-btn>
      </q-td>
    </template>
    <!--End option td-->
  </q-table>
</template>

<script setup>
// import
import { useI18n } from 'vue-i18n';
import { Utils } from 'src/utils/utils';
import { useRouter, useRoute } from 'vue-router';

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
  editScope: String,
  deleteScope: String,
  pagination: {
    type: Object,
    default: () => { }
  }
});

// emits
const emit = defineEmits(['edit', 'delete']);

// references
const { t } = useI18n();
const route = useRoute();
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
  guide_printed: t('guide_printed'),
  guide_news: t('guide_news'),
}

const statusColor = {
  pending: 'bg-yellow',
  in_progress: 'bg-primary',
  delivered: 'bg-green',
  cancelled: 'bg-red',
  returned: 'bg-warning',
  guide_printed: 'bg-green',
  guide_news: 'bg-warning',
}

// methods
const handlerPagination = (e) => {
  const { pagination } = e;
  router.push({
    name: route.name,
    query: {
      page: pagination.page || 1,
      perPage: pagination.rowsPerPage,
      search: route.query.search || '',
    }
  });
}
</script>

<style scoped lang="scss">
a {
  color: $primary;
  text-decoration: none;
  font-weight: 400;
}
</style>
