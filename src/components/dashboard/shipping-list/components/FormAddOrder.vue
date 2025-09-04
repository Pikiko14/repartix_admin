<template>
  <q-form @submit="handlerSaveOrder" class="row">
    <div class="col-12">
      <label for="reference">
        {{ t('reference') }}
      </label>
      <q-input :loading="loading" id="reference" mask="###############" @update:model-value="loadOrders" debounce="1500"
        placeholder="000000001" outlined dense :rules="[(val) => !!val || t('requiredField')]"
        v-model="reference"></q-input>
    </div>

    <div class="col-12">
      <q-scroll-area style="width: 100%; height: 320px" v-if="orders.length > 0">
        <q-list class="q-px-none" dense>
          <q-item class="q-px-none" tag="label" v-ripple v-for="(order, idx) in orders" :key="idx">
            <q-item-section avatar>
              <q-radio v-model="selectedOrder" :val="order._id" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="address-label">{{ `${order.reference}` }}</q-item-label>
              <q-item-label caption>{{ `${order?.client?.name} ${order?.client?.last_name}` }}</q-item-label>
              <q-item-label caption>{{ `${order?.client?.address}` }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </div>

    <div class="col-12 text-center q-mt-lg">
      <q-btn :disabled="!reference" :label="t('add')" color="primary" type="submit" unelevated no-caps rounded></q-btn>
    </div>
  </q-form>
</template>

<script setup>
// imports
import { useI18n } from 'vue-i18n';
import { useOrdersStore } from 'src/stores/ordersStore';
import { ordersContent } from 'src/composables/ordersContent';
import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { shippingListContent } from 'src/composables/shippingListContent';

// emits
const emits = defineEmits(['close-modal']);

// refernces
const { t } = useI18n();
const reference = ref('');
const loading = ref(false);
const savingOrder = ref(false);
const selectedOrder = ref(null);
const orderStore = useOrdersStore();
const orderContent = ordersContent();
const content = shippingListContent();

// computed
const orders = computed(() => {
  return orderStore.getOrders;
});

// methods
const handlerSaveOrder = async () => {
  savingOrder.value = true;
  try {
    const { order } = await orderContent.doShowOrder(selectedOrder.value);
    if (order) {
      const orderObj = {
        id: order._id,
        reference: order.reference,
        client: {
          name: order.client.name,
          last_name: order.client?.last_name,
          address: order?.client?.address,
          phone: order?.client?.phone
        },
        sender: {
          brand_name: order?.sender?.brand_name,
          brand_phone: order?.sender?.brand_phone
        },
        status: order.status,
        order_price: `${order.order_price}`,
        cash_on_delivery: order.cash_on_delivery,
        cash_amount: order.cash_amount
      }
      content.setNewOrder(orderObj);
      emits('close-modal');
    }
  } finally {
    savingOrder.value = false;
  }
}

const loadOrders = async (e) => {
  loading.value = true;
  try {
    await orderContent.doListOrders(`page=1&perPage=20&search=${e}`);
  } finally {
    loading.value = false;
  }
}

// hook
onBeforeMount(() => {
  orderStore.clearOrders();
});

onBeforeUnmount(() => {
  orderStore.clearOrders();
});
</script>
