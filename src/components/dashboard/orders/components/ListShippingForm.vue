<template>
  <q-form @submit="handlerCreateShippingList" class="row">
    <div class="col-12">
      <label for="courier">{{ t('courierSelect') }}</label>
      <q-select map-options emit-value v-model="courier" :options="couriers" rounded outlined dense
        :rules="[(val) => !!val || t('requiredField')]" id="courier" :label="t('selectOneOptions')"></q-select>
    </div>
    <div class="col-12 text-center">
      <q-btn rounded color="primary" no-caps unelevated type="submit" :label="t('save')"></q-btn>
    </div>
  </q-form>
</template>

<script setup>
// imports
import { useI18n } from 'vue-i18n';
import { onBeforeMount, computed, ref } from 'vue';
import { useCouriersStore } from 'src/stores/couriersStore';
import { couriersContent } from 'src/composables/couriersContent';

// emits
const emit = defineEmits(['create-shipping-list']);

// references
const { t } = useI18n();
const courier = ref(null);
const store = useCouriersStore();
const content = couriersContent();

// computed
const couriers = computed(() => {
  return store.getCouriers.map((el) => {
    return {
      label: el?.profile?.full_name,
      value: el,
    }
  });
});

// method
const loadSenders = async () => {
  await content.doListCourier('page=1&perPage=100');
}

const handlerCreateShippingList = () => {
  emit('create-shipping-list',  courier.value);
}

// hook
onBeforeMount(async () => {
  await loadSenders();
});
</script>
