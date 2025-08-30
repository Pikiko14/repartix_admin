<template>
  <q-form @submit="handlerSaveConfig" class="row">
    <div class="col-12">
      <label class="text-dark" for="payments">{{ t('paymentsMethods') }}</label><br />
      <span class="text-bold">{{ t('note') }}:</span> {{ t('statusesDescription') }}
      <q-input
        :readonly="!edit"
        id="payments"
        class="q-mt-md"
        :rules="[
          (val) => !!val || t('requiredField'),
        ]"
        outlined
        dense type="textarea"
        v-model="configuration.payments"
        placeholder="Cash | Transfer | USDT">
      </q-input>
    </div>
    <div class="col-12 text-right q-mt-md">
      <q-btn v-if="edit" :loading="loading" unelevated size="md" type="submit" no-caps rounded :label="t('save')"
        color="primary"></q-btn>
      <q-btn no-caps v-else unelevated size="md" rounded :label="t('edit')" color="primary"
        @click="edit = !edit"></q-btn>
    </div>
  </q-form>
</template>

<script setup>
//imports
import { useI18n } from 'vue-i18n';
import { computed, onBeforeMount, ref } from 'vue';
import { useAuthStore } from 'src/stores/authStore';
import { notification } from 'src/boot/notification';
import { authContent } from 'src/composables/authContent';

// references
const oldValue = ref(0);
const { t } = useI18n();
const edit = ref(false);
const loading = ref(false);
const store = useAuthStore();
const configuration = ref({});
const authApi = authContent();

// computed
const user = computed(() => {
  return store.getUser;
});

// methods
const handlerSaveConfig = async () => {
  const params = JSON.parse(JSON.stringify(configuration.value));
  if (params.price_by_km > 0) {
    params.price_by_km = parseFloat(params.price_by_km) || parseFloat(oldValue);
  } else {
    params.price_by_km = parseFloat(oldValue.value) || 0;
  }
  try {
    const response = await authApi.doUpdateBrandConfiguration(params);
    if (response && response.success) {
      notification('success', t('changeBrandConfigurationSuccess'), 'primary');
      edit.value = false;
    }
  } finally {
    loading.value = false;
  }
}


// hook
onBeforeMount(() => {
  if (user.value.brand && user.value.brand.configuration) {
    configuration.value = user.value.brand.configuration;
    if (!configuration.value.route_price_by_km) {
      configuration.value.route_price_by_km = false;
    }
  }
})
</script>
