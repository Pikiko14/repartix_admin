<template>
  <q-form @submit.prevent.stop="handlerGenerateRoute" class="row">
    <div class="col-12">
      <label for="shipping_list">
        {{ t('shippingList') }}
      </label>
      <q-select
        id="shipping_list"
        v-model="form.shipping_list_id"
        :options="shippingListOptions"
        option-label="label"
        option-value="value"
        emit-value
        map-options
        outlined
        dense
        :loading="loadingShippingLists"
        :rules="[(val) => !!val || t('requiredField')]"
        :label="t('selectShippingList')"
        @update:model-value="loadShippingListDetails"
      />
    </div>

    <div class="col-12 q-mt-md" v-if="form.shipping_list_id">
      <label for="strategy">
        {{ t('optimizationStrategy') }}
      </label>
      <q-select
        id="strategy"
        v-model="form.strategy"
        :options="strategyOptions"
        outlined
        dense
        :rules="[(val) => !!val || t('requiredField')]"
        :label="t('selectStrategy')"
      />
    </div>

    <div class="col-12 q-mt-md" v-if="form.strategy === 'google_maps'">
      <q-banner class="bg-info text-white">
        {{ t('googleMapsApiKeyRequired') }}
      </q-banner>
    </div>

    <div class="col-12 q-mt-md">
      <q-checkbox
        v-model="generatePickupRoute"
        :label="t('generatePickupRoute')"
      />
    </div>

    <div class="col-12 q-mt-md">
      <q-checkbox
        v-model="generateDeliveryRoute"
        :label="t('generateDeliveryRoute')"
      />
    </div>

    <div class="col-12 text-center q-mt-lg">
      <q-btn
        :disabled="!form.shipping_list_id || !form.strategy || (!generatePickupRoute && !generateDeliveryRoute) || loading || isSubmitting"
        :loading="loading"
        :label="t('generateRoute')"
        color="primary"
        type="submit"
        unelevated
        no-caps
        rounded
      />
    </div>
  </q-form>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { ref, onBeforeMount } from 'vue';
import { routesContent } from 'src/composables/routesContent';
import { shippingListContent } from 'src/composables/shippingListContent';
import { useShippingListStore } from 'src/stores/shippingListStore';
import { notification } from 'src/boot/notification';

const emits = defineEmits(['close-modal', 'route-generated']);

const { t } = useI18n();
const loading = ref(false);
const isSubmitting = ref(false);
const loadingShippingLists = ref(false);
const form = ref({
  shipping_list_id: null,
  strategy: 'haversine',
});
const generatePickupRoute = ref(true);
const generateDeliveryRoute = ref(true);
const shippingListStore = useShippingListStore();
const routesContentInstance = routesContent();
const shippingListContentInstance = shippingListContent();

const strategyOptions = [
  { label: t('haversine'), value: 'haversine' },
  { label: t('googleMaps'), value: 'google_maps' },
];

const shippingListOptions = ref([]);

const loadShippingLists = async () => {
  loadingShippingLists.value = true;
  try {
    await shippingListContentInstance.doListShippingMethods('page=1&perPage=100&search=');
    const shippingLists = shippingListStore.getShippings;
    shippingListOptions.value = shippingLists.map((sl) => ({
      label: `${sl.reference} - ${sl.courier?.full_name || ''}`,
      value: sl._id,
      shippingList: sl,
    }));
  } finally {
    loadingShippingLists.value = false;
  }
};

const loadShippingListDetails = (shippingListId) => {
  // Puede usarse para cargar detalles adicionales del shipping list si es necesario
  const selected = shippingListOptions.value.find((opt) => opt.value === shippingListId);
  if (selected?.shippingList) {
    // Aquí se pueden agregar acciones adicionales si es necesario
  }
};

const handlerGenerateRoute = async (e) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }
  
  if (loading.value || isSubmitting.value) {
    return;
  }

  if (!generatePickupRoute.value && !generateDeliveryRoute.value) {
    notification('negative', t('selectAtLeastOneRouteType'), 'red');
    return;
  }

  if (!form.value.shipping_list_id || !form.value.strategy) {
    notification('negative', t('requiredFieldsMissing'), 'red');
    return;
  }

  isSubmitting.value = true;
  loading.value = true;
  const routesGenerated = [];
  const errors = [];

  try {
    // Verificar rutas existentes antes de crear
    let pickupExists = false;
    let deliveryExists = false;

    if (generatePickupRoute.value) {
      try {
        const pickupCheck = await routesContentInstance.doGetOptimizedRoute(
          form.value.shipping_list_id,
          'pickup'
        );
        pickupExists = pickupCheck?.success && pickupCheck?.data !== null;
      } catch {
        // Si hay error al verificar, asumimos que no existe
        pickupExists = false;
      }
    }

    if (generateDeliveryRoute.value) {
      try {
        const deliveryCheck = await routesContentInstance.doGetOptimizedRoute(
          form.value.shipping_list_id,
          'delivery'
        );
        deliveryExists = deliveryCheck?.success && deliveryCheck?.data !== null;
      } catch {
        // Si hay error al verificar, asumimos que no existe
        deliveryExists = false;
      }
    }

    // Si ambas rutas existen y ambas están marcadas para generar, mostrar error
    if (pickupExists && deliveryExists && generatePickupRoute.value && generateDeliveryRoute.value) {
      notification('negative', t('bothRoutesAlreadyExist'), 'red');
      return;
    }

    // Generar solo las rutas que no existen
    if (generatePickupRoute.value && !pickupExists) {
      try {
        const pickupResult = await routesContentInstance.doOptimizeRoute({
          shipping_list_id: form.value.shipping_list_id,
          strategy: form.value.strategy,
          route_type: 'pickup',
        });

        if (pickupResult?.success) {
          routesGenerated.push({ type: 'pickup', data: pickupResult.data });
        } else if (pickupResult?.message) {
          errors.push({ type: 'pickup', message: pickupResult.message });
        }
      } catch (error) {
        const errorMessage = error?.response?.data?.message || error?.message || t('errorGeneratingPickupRoute');
        errors.push({ type: 'pickup', message: errorMessage });
        console.error('Error generating pickup route:', error);
      }
    } else if (generatePickupRoute.value && pickupExists) {
      errors.push({ type: 'pickup', message: t('pickupRouteAlreadyExists') });
    }

    if (generateDeliveryRoute.value && !deliveryExists) {
      try {
        const deliveryResult = await routesContentInstance.doOptimizeRoute({
          shipping_list_id: form.value.shipping_list_id,
          strategy: form.value.strategy,
          route_type: 'delivery',
        });

        if (deliveryResult?.success) {
          routesGenerated.push({ type: 'delivery', data: deliveryResult.data });
        } else if (deliveryResult?.message) {
          errors.push({ type: 'delivery', message: deliveryResult.message });
        }
      } catch (error) {
        const errorMessage = error?.response?.data?.message || error?.message || t('errorGeneratingDeliveryRoute');
        errors.push({ type: 'delivery', message: errorMessage });
        console.error('Error generating delivery route:', error);
      }
    } else if (generateDeliveryRoute.value && deliveryExists) {
      errors.push({ type: 'delivery', message: t('deliveryRouteAlreadyExists') });
    }

    if (routesGenerated.length > 0) {
      const successMessage = routesGenerated.length === 2 
        ? t('routesGeneratedSuccessfully')
        : `${t('routeGenerated')}: ${routesGenerated[0].type === 'pickup' ? t('pickup') : t('deliveryRoute')}`;
      notification('success', successMessage, 'primary');
      emits('route-generated', routesGenerated);
      emits('close-modal');
    }

    if (errors.length > 0) {
      errors.forEach((error) => {
        const errorType = error.type === 'pickup' ? t('pickup') : t('deliveryRoute');
        notification('negative', `${errorType}: ${error.message}`, 'red');
      });
    }

    if (routesGenerated.length === 0 && errors.length === 0) {
      notification('negative', t('errorGeneratingRoute'), 'red');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    notification('negative', error?.response?.data?.message || error?.message || t('errorGeneratingRoute'), 'red');
  } finally {
    loading.value = false;
    isSubmitting.value = false;
  }
};

onBeforeMount(() => {
  loadShippingLists();
});
</script>

