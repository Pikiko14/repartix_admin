<template>
  <q-form @submit="handlerSavePayment" class="row">
    <div class="col-12">
      <label for="methods">{{ t('method') }}</label>
      <q-input id="methods" placeholder="Usdt | Btc | Trans" outlined dense v-model="payment.methods"
        :rules="[(val) => !!val || t('requiredField')]" />
    </div>
    <div class="col-12">
      <label for="amount">{{ t('amount') }}</label>
      <q-input v-money="money" id="amount" placeholder="150.000,00" outlined dense v-model="payment.amount"
        :rules="[(val) => !!val || t('requiredField')]" />
    </div>
    <div class="col-12">
      <label for="file">{{ t('selectOneFile') }}</label>
      <q-file id="file" label="JPG, PNG, WEBP" v-model="payment.file" outlined dense accept=".jpg, image/*"
        :rules="[(val) => !!val || t('requiredField')]"></q-file>
    </div>
    <div class="col-12 text-center">
      <q-btn :loading="loading" type="submit" color="primary" unelevated rounded :label="t('save')"></q-btn>
    </div>
  </q-form>
</template>

<script setup>
// import
import { VMoney } from 'v-money';
import { useI18n } from 'vue-i18n';
import { ref, defineProps } from 'vue';
import { notification } from 'src/boot/notification';
import { ordersContent } from 'src/composables/ordersContent';

// props
const props = defineProps({
  orderId: {
    type: String,
    default: ''
  }
});

// emit
const emit = defineEmits(['close-modal']);

// references
const { t } = useI18n();
const payment = ref({});
const loading = ref(false);
const content = ordersContent();

const money = {
  decimal: ',',
  thousands: '.',
  prefix: '',
  suffix: ' ',
  precision: 0
}

// methods
const handlerSavePayment = async () => {
  const form = new FormData();
  form.append('order_id', props.orderId);
  form.append('file', payment.value.file);
  form.append('amount', payment.value.amount);
  form.append('methods', payment.value.methods);

  try {
    loading.value = true;
    const response = await content.doCreatePayment(form);
    if (response?.success) {
      emit('close-modal');
      notification('success', t('paymentCreatedSuccess'), 'primary');
    }
  } finally {
    loading.value = false;
  }
}
</script>
