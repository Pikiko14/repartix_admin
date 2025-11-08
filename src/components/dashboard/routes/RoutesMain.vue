<template>
  <section class="routes-main">
    <HeaderPage
      @do-search="doHandlerSearch"
      @add-new="showAddButton"
      :scope="'optimize-route'"
      :show-add-button="true"
      :title="t('routes')"
    />

    <MainTable
      class="q-mt-lg"
      :key="pagination.rowsNumber + '-' + pagination.page"
      :pagination="pagination"
      :columns="columns"
      :rows="routes"
      edit-scope="none"
      delete-scope="optimize-route"
      show-route-scope="view-optimized-route"
      @show-route="showRoute"
      @delete="doDeleteRoute"
    />

    <q-dialog v-model="modalRoute" @before-hide="route = {}">
      <ModalCard styles="width: 800px" :title="t('generateRoute')">
        <template #body>
          <RoutesForm @close-modal="showAddButton" @route-generated="handlerRouteGenerated" />
        </template>
      </ModalCard>
    </q-dialog>

    <q-dialog v-model="modalViewRoute" @before-hide="selectedRoute = null">
      <ModalCard styles="width: 900px" :title="t('routeDetails')">
        <template #body>
          <RouteView v-if="selectedRoute" :route-data="selectedRoute" />
        </template>
      </ModalCard>
    </q-dialog>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { computed, ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ModalCard from 'src/components/partials/ModalCard.vue';
import MainTable from 'src/components/partials/MainTable.vue';
import HeaderPage from 'src/components/partials/HeaderPage.vue';
import { useRoutesStore } from 'src/stores/routesStore';
import { routesContent } from 'src/composables/routesContent';
import RoutesForm from './components/RoutesForm.vue';
import RouteView from './components/RouteView.vue';
import { useQuasar } from 'quasar';
import { notification } from 'src/boot/notification';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const modalRoute = ref(false);
const modalViewRoute = ref(false);
const selectedRoute = ref(null);
const q = useQuasar();
const store = useRoutesStore();
const content = routesContent();

const columns = [
  {
    name: 'shipping_list_reference',
    required: true,
    label: t('shippingList'),
    align: 'left',
    field: (row) => row.shipping_list_reference,
    sortable: false,
  },
  {
    name: 'route_type',
    required: true,
    label: t('routeType'),
    align: 'center',
    field: (row) => {
      if (row.route_type === 'pickup') {
        return t('pickup');
      }
      if (row.route_type === 'delivery') {
        return t('deliveryRoute');
      }
      return row.route_type || t('notGenerated');
    },
    sortable: false,
  },
  {
    name: 'strategy',
    required: true,
    label: t('strategy'),
    align: 'center',
    field: (row) => {
      if (row.strategy === 'google_maps') {
        return t('googleMaps');
      }
      if (row.strategy === 'haversine') {
        return t('haversine');
      }
      return row.strategy;
    },
    sortable: false,
  },
  {
    name: 'total_distance',
    required: true,
    label: t('totalDistance'),
    align: 'center',
    field: (row) => `${row.total_distance?.toFixed(2) || 0} km`,
    sortable: false,
  },
  {
    name: 'points_count',
    required: true,
    label: t('pointsCount'),
    align: 'center',
    field: (row) => row.route?.length || 0,
    sortable: false,
  },
  {
    name: 'options',
    required: true,
    label: t('options'),
    align: 'center',
  },
];

const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: route.query.page || 1,
  rowsPerPage: route.query.perPage || 10,
  rowsNumber: 1,
});

const routes = computed(() => {
  return store.getRoutes;
});

const showAddButton = () => {
  modalRoute.value = !modalRoute.value;
};

const handlerListRoutes = async () => {
  const page = route.query.page || 1;
  const search = route.query.search || '';
  const perPage = route.query.perPage || 10;

  let query = `page=${page}&perPage=${perPage}&search=${search}`;

  try {
    await content.doListRoutes(query);
    pagination.value.rowsNumber = store.getTotalItems;
  } catch (error) {
    console.error(error);
  }
};

const doHandlerSearch = (search) => {
  router.push({
    name: route.name,
    query: {
      page: 1,
      perPage: route.query.perPage || 10,
      search: search || '',
    },
  });
};

const showRoute = async (id) => {
  try {
    const routeData = routes.value.find((r) => r._id === id);
    if (routeData) {
      const result = await content.doGetOptimizedRoute(routeData.shipping_list_id, routeData.route_type);
      if (result?.success && result?.data) {
        selectedRoute.value = {
          ...result.data,
          shipping_list_reference: routeData.shipping_list_reference,
          route_type: routeData.route_type,
          strategy: routeData.strategy,
        };
        modalViewRoute.value = true;
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const doDeleteRoute = (id) => {
  const description = t('deleteRouteDescription');
  const routeData = routes.value.find((r) => r._id === id);
  const name = routeData?.shipping_list_reference || id;
  q.dialog({
    title: t('deleteRoute'),
    message: description.replace('-name', ` ${name}`),
    cancel: true,
  }).onOk(() => {
    handlerDeleteRoute(id);
  });
};

const handlerDeleteRoute = async (id) => {
  try {
    const data = await content.doDeleteRoute(id);
    if (data?.success) {
      notification('success', t('routeDeleted'), 'primary');
      handlerListRoutes();
    }
  } catch (error) {
    console.error(error);
    notification('negative', t('errorDeletingRoute'), 'red');
  }
};

const handlerRouteGenerated = () => {
  handlerListRoutes();
};

watch(
  () => [route.query.page, route.query.search, route.query.perPage],
  () => {
    if (route.query.page) {
      pagination.value.page = parseInt(route.query.page);
    }
    if (route.query.perPage) {
      pagination.value.rowsPerPage = parseInt(route.query.perPage);
    }
    handlerListRoutes();
  },
  { immediate: false }
);

onMounted(() => {
  if (route.query.page) {
    pagination.value.page = parseInt(route.query.page);
  }
  if (route.query.perPage) {
    pagination.value.rowsPerPage = parseInt(route.query.perPage);
  }
  handlerListRoutes();
});
</script>

