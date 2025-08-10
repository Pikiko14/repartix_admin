<template>
  <section class="city-main">
    <!--Header-->
    <HeaderPage @do-search="doHandlerSearch" @add-new="showAddButton" :scope="'create-city'" :show-add-button="true"
      :title="t('city')" />
    <!--End header-->

    <!--Table-->
    <MainTable class="q-mt-lg" :key="pagination.rowsNumber + '-' + pagination.page" :pagination="pagination"
      :columns="columns" :rows="cities" edit-scope="update-city" delete-scope="delete-city"
      @edit="handlerUpdateCities" @delete="doDeleteCities" />
    <!--End table-->

    <!--Modal cities-->
    <q-dialog v-model="modalCities" @before-hide="city = {}">
      <ModalCard :title="!city._id ? t('cityCreate') : t('cityUpdate')">
        <template #body>
          123
        </template>
      </ModalCard>
    </q-dialog>
    <!--End modal cities-->
  </section>
</template>

<script setup>
  // imports
  import { useQuasar } from 'quasar';
  import { useI18n } from 'vue-i18n';
  import { computed, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { notification } from 'src/boot/notification';
  import { useCitiesStore } from 'src/stores/citiesStore';
  import ModalCard from 'src/components/partials/ModalCard.vue';
  import MainTable from 'src/components/partials/MainTable.vue';
  import { citiesContent } from 'src/composables/citiesContent';
  import HeaderPage from 'src/components/partials/HeaderPage.vue';

  // references
  const city = ref({});
  const q = useQuasar();
  const { t } = useI18n();
  const route = useRoute();
  const router = useRouter();
  const modalCities = ref(false);
  const columns = [
    {
      name: 'name',
      required: true,
      label: t('name'),
      align: 'left',
      field: row => row.name,
      sortable: false
    },
    {
      name: 'province',
      required: true,
      label: t('province'),
      align: 'left',
      field: row => row.province,
      sortable: false
    },
    {
      name: 'zones',
      required: true,
      label: t('zones'),
      align: 'center',
      field: row => row.zones.length || 0,
      sortable: false
    },
    {
      name: 'codCity',
      required: true,
      label: t('cod'),
      align: 'center',
      field: row => row.cod_city,
      sortable: false
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
  const store = useCitiesStore();
  const content = citiesContent();

  // computed
  const cities = computed(() => {
    return store.getCities;
  });

  // methods
  const showAddButton = () => {
    modalCities.value = !modalCities.value;
  }

  const handlerListCities = async () => {
    const page = route.query.page || 1;
    const search = route.query.search || '';
    const perPage = route.query.perPage || 10;

    const query = `page=${page}&perPage=${perPage}&search=${search}`;

    await content.doListCities(query);
    pagination.value.rowsNumber = store.getTotalItems;
  }

  const doHandlerSearch = (search) => {
    router.push({
      name: route.name,
      query: {
        page: route.query.page || 1,
        perPage: route.query.perPage,
        search: search || '',
      }
    });
  }

  const handlerUpdateCities = (id) => {
    const cityObj = cities.value.find((el) => el._id === id);
    city.value = cityObj;
    showAddButton();
  }

  const doDeleteCities = (id) => {
    const description = t('deleteCityDescription');
    const city = cities.value.find((el) => el._id === id);
    const name = city.name;
    q.dialog({
      title: t('deleteCity'),
      message: description.replace('-id', ` ${name}`),
      cancel: true,
    }).onOk(() => {
      handlerDeleteCities(id);
    });
  }

  const handlerDeleteCities = async (id) => {
    const data = await content.doDeleteCities(id);

    if (data?.success) {
      notification('success', t('cityDeleted'), 'primary');
      pagination.value.rowsNumber = store.getTotalItems;
    }

    if (cities.value.length === 0) {
      router.push({
        name: route.name,
        query: {
          page: parseInt(route.query.page) - 1 || 1,
          perPage: route.query.perPage,
          search: route.query.search || '',
        }
      });
    }
  }

  // const setTotalItems = () => {
  //   pagination.value.rowsNumber = store.getTotalItems;
  // }

  // hook
  if (route.query.page) {
    pagination.value.page = parseInt(route.query.page);
  }
  if (route.query.perPage) {
    pagination.value.rowsPerPage = parseInt(route.query.perPage);
  }
  handlerListCities();
</script>
