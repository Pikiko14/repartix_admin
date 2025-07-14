<template>
  <q-form @submit="handlerSaveConfig" class="row">
    <div class="col-12">
      <label class="text-dark" for="country">{{ t('country') }}</label>
      <q-select :readonly="!edit" :option-value="opt => Object(opt) === opt && 'label' in opt ? opt.label : null"
        emit-value @update:model-value="setCountryAndCurrency" :rules="[(val) => !!val || t('selectOneOption')]"
        v-model="configuration.country" dense :options="americanPhoneCodes" id="country" outlined></q-select>
    </div>
    <div class="col-6" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
      <label class="text-dark" for="currency">{{ t('currency') }}</label>
      <q-input :readonly="!edit" dense id="currency" :rules="[
        (val) => !!val || t('requiredField'),
      ]" outlined v-model="configuration.currency" placeholder="COP"></q-input>
    </div>
    <div class="col-6" :class="{ 'q-pl-sm': $q.screen.gt.sm }">
      <label class="text-dark" for="priceByKm">{{ t('priceByKm') }}</label>
      <q-toggle :disable="!edit" left-label v-model="configuration.route_price_by_km" checked-icon="check"
        color="primary" unchecked-icon="clear" />
    </div>
    <div class="col-12" v-if="configuration.route_price_by_km">
      <label class="text-dark" for="price">{{ t('price') }}</label>
      <q-input @blur="formatCurrency" @focus="unformatCurrency" type="text" :readonly="!edit" dense id="price" :rules="[
        (val) => !!val || t('requiredField'),
      ]" outlined v-model="configuration.price_by_km" placeholder="7500.00"></q-input>
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
import { americanPhoneCodes } from 'src/utils/constant';
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
  params.price_by_km = parseFloat(oldValue.value) || 0;
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

const setCountryAndCurrency = (country) => {
  const countryObj = americanPhoneCodes.find((el) => el.label === country);
  configuration.value.currency = countryObj.currency || 'COP';
}

function formatCurrency() {
  if (configuration.value.price_by_km) {
    const number = parseFloat(configuration.value.price_by_km);
    oldValue.value = number;
    configuration.value.price_by_km = number.toLocaleString('es-CO', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}

function unformatCurrency() {
  if (configuration.value.price_by_km) {
    configuration.value.price_by_km = configuration.value.price_by_km?.toString() || '';
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
