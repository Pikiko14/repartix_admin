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

    <!--Option td-->
    <template v-slot:body-cell-options="props">
      <q-td :props="props">
        <q-btn @click="emit('edit', props.row._id)" v-if="utils.validateRole(editScope)" icon="edit" flat dense
          rounded color="primary">
          <q-tooltip class="bg-primary">
            {{ t('edit') }}
          </q-tooltip>
        </q-btn>
        <q-btn @click="emit('delete', props.row._id)" v-if="utils.validateRole(deleteScope)" icon="delete" flat dense rounded color="red">
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
