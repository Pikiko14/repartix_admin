<template>
  <div class="route-view">

    <div class="row q-mb-md">
      <div class="col-6">
        <strong>{{ t('shippingList') }}:</strong> {{ routeData.shipping_list_reference || '-' }}
      </div>
      <div class="col-6">
        <strong>{{ t('routeType') }}:</strong>
        <q-chip
          dense
          :color="routeData.route_type === 'pickup' ? 'orange' : 'blue'"
          text-color="white"
        >
          {{ routeData.route_type === 'pickup' ? t('pickup') : t('deliveryRoute') }}
        </q-chip>
      </div>
    </div>

    <div class="row q-mb-md">
      <div class="col-6">
        <strong>{{ t('strategy') }}:</strong> {{ getStrategyLabel(routeData.strategy) }}
      </div>
      <div class="col-6">
        <strong>{{ t('totalDistance') }}:</strong> {{ routeData.total_distance?.toFixed(2) || 0 }} km
      </div>
    </div>

    <div class="row q-mb-md">
      <div class="col-6">
        <strong>{{ t('pointsCount') }}:</strong> {{ routeData.route?.length || 0 }}
      </div>
      <div class="col-6" v-if="routeData.total_duration">
        <strong>{{ t('totalDuration') }}:</strong>
        {{ formatDuration(routeData.total_duration) }}
      </div>
    </div>

    <q-separator class="q-my-md" />

    <div class="row">
      <div class="col-12">
        <h6 class="text-primary q-ma-none q-mb-md">{{ t('routePoints') }}</h6>
        
        <q-tabs v-model="tab" no-caps class="text-primary">
          <q-tab name="pickup" :label="`${t('pickup')} (${pickupPoints.length})`" />
          <q-tab name="delivery" :label="`${t('deliveryRoute')} (${deliveryPoints.length})`" />
        </q-tabs>

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="pickup">
            <q-list bordered separator v-if="pickupPoints.length > 0">
              <q-item
                v-for="(point, index) in pickupPoints"
                :key="index"
                class="bg-orange-1"
              >
                <q-item-section avatar>
                  <q-chip
                    dense
                    color="orange"
                    text-color="white"
                  >
                    {{ index + 1 }}
                  </q-chip>
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    <strong>{{ point.name || point.address }}</strong>
                  </q-item-label>
                  <q-item-label caption>
                    {{ point.address }}
                  </q-item-label>
                  <q-item-label caption v-if="point.reference">
                    {{ t('reference') }}: {{ point.reference }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip
                    dense
                    color="orange"
                    text-color="white"
                  >
                    {{ t('pickup') }}
                  </q-chip>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-center q-pa-md text-grey">
              {{ t('noPickupPoints') }}
            </div>
          </q-tab-panel>

          <q-tab-panel name="delivery">
            <q-list bordered separator v-if="deliveryPoints.length > 0">
              <q-item
                v-for="(point, index) in deliveryPoints"
                :key="index"
                class="bg-blue-1"
              >
                <q-item-section avatar>
                  <q-chip
                    dense
                    color="blue"
                    text-color="white"
                  >
                    {{ index + 1 }}
                  </q-chip>
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    <strong>{{ point.name || point.address }}</strong>
                  </q-item-label>
                  <q-item-label caption>
                    {{ point.address }}
                  </q-item-label>
                  <q-item-label caption v-if="point.reference">
                    {{ t('reference') }}: {{ point.reference }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip
                    dense
                    color="blue"
                    text-color="white"
                  >
                    {{ t('deliveryRoute') }}
                  </q-chip>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-center q-pa-md text-grey">
              {{ t('noDeliveryPoints') }}
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { computed, ref, watch } from 'vue';

const props = defineProps({
  routeData: {
    type: Object,
    required: true,
  },
});

const { t } = useI18n();
const tab = ref('pickup');

const pickupPoints = computed(() => {
  return props.routeData.route?.filter(point => point.type === 'sender') || [];
});

const deliveryPoints = computed(() => {
  return props.routeData.route?.filter(point => point.type === 'client') || [];
});

watch([pickupPoints, deliveryPoints], () => {
  if (pickupPoints.value.length === 0 && deliveryPoints.value.length > 0) {
    tab.value = 'delivery';
  } else if (pickupPoints.value.length > 0) {
    tab.value = 'pickup';
  }
}, { immediate: true });

const getStrategyLabel = (strategy) => {
  if (strategy === 'google_maps') {
    return t('googleMaps');
  }
  if (strategy === 'haversine') {
    return t('haversine');
  }
  return strategy;
};

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
};
</script>

<style scoped>
.route-view {
  padding: 1rem;
}
</style>

