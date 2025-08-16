<template>
  <q-form @submit="handlerSaveCouriers" class="row">
    <q-tabs v-model="tab" no-caps dense class="text-primary full-width q-pa-none">
      <q-tab name="access" :label="t('access')" />
      <q-tab name="profile" :label="t('profile')" />
      <q-tab name="delivery" :label="t('delivery')" />
    </q-tabs>

    <q-tab-panels class="full-width" v-model="tab" animated swipeable vertical transition-prev="jump-up"
      transition-next="jump-up">
      <q-tab-panel class="q-pa-none q-px-md" name="access">
        <div class="row q-mt-md">
          <div class="col-12">
            <label class="text-dark" for="username">{{ t('username') }}</label>
            <q-input dense id="username" :rules="[
              (val) => !!val || t('requiredField'),

            ]" outlined v-model="courier.username" placeholder="jhondoe"></q-input>
          </div>

          <div class="col-12 col-md-6" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
            <label class="text-dark" for="password">{{ t('password') }}</label>
            <q-input dense id="password" :rules="courier._id ? [] : [
              (val) => !!val || t('requiredField'),
              (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/.test(val) || t('passwordStrong')
            ]" type="password" outlined v-model="courier.password" placeholder="*********"></q-input>
          </div>

          <div class="col-12 col-md-6" :class="{ 'q-pl-sm': $q.screen.gt.sm, 'q-mt-md': $q.screen.lt.md }">
            <label class="text-dark" for="password_confirm">{{ t('password_confirmation') }}</label>
            <q-input dense id="password_confirm" :rules="courier._id ? [] : [
              (val) => !!val || t('requiredField'),
              (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/.test(val) || t('passwordStrong'),
              (val) => val === courier.password || t('dontMatchPassword')
            ]" type="password" outlined v-model="courier.confirmation_password" placeholder="*********"></q-input>
          </div>

          <div class="col-12" :class="{ 'q-mt-md': courier._id }">
            <label class="text-dark" for="email">{{ t('email') }}</label>
            <q-input dense id="email" :rules="[
              (val) => !!val || t('requiredField'),
              (val) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/.test(val) || t('invalidEmail')
            ]" outlined v-model="courier.email" placeholder="jhon@doe.com"></q-input>
          </div>
        </div>
      </q-tab-panel>

      <q-tab-panel class="q-pa-none q-px-md" name="profile">
        <div class="row q-mt-md">
          <div class="col-12">
            <label class="text-dark" for="full_name">{{ t('fullName') }}</label>
            <q-input dense id="full_name" :rules="[
              (val) => !!val || t('requiredField'),

            ]" outlined v-model="courier.profile.full_name" placeholder="jhon doe"></q-input>
          </div>
          <div class="col-12 col-md-6" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
            <label class="text-dark" for="phone">{{ t('phone') }}</label>
            <q-input mask="+## ##########" dense id="phone" :rules="[
              (val) => val.length > 0 || t('requiredField'),
              (val) => /^\+\d{1,3} ?\d{7,12}$/.test(val) || t('invalidPhone'),
            ]" outlined v-model="courier.profile.phone" placeholder="+57 3225361689">
            </q-input>
          </div>
          <div class="col-12 col-md-6" :class="{ 'q-pl-sm': $q.screen.gt.sm }">
            <label class="text-dark" for="dni">{{ t('dni') }}</label>
            <q-input dense id="dni" mask="###############" max="15" :rules="[
              (val) => !!val || t('requiredField'),

            ]" outlined v-model="courier.profile.dni" placeholder="9876543210"></q-input>
          </div>
          <div class="col-12">
            <label class="text-dark" for="address">{{ t('address') }}</label>
            <q-input dense id="address" :rules="[
              (val) => !!val || t('requiredField'),

            ]" outlined v-model="courier.profile.address" placeholder="Carrera 81 # 6A - 51"></q-input>
          </div>
        </div>
      </q-tab-panel>

      <q-tab-panel class="q-pa-none q-px-md" name="delivery">
        <div class="row q-mt-md">
          <div class="col-12">
            <label class="text-dark" for="typeVehicle">{{ t('typeVehicle') }}</label>
            <q-select map-options emit-value v-model="courier.courier_info.vehicle_type" id="typeVehicle" :rules="[
              (val) => !!val || t('requiredField'),

            ]" outlined dense label="Selecciona una opción" :options="typeVehicles"></q-select>
          </div>
          <div class="col-12 col-md-6" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
            <label class="text-dark" for="license_plate">{{ t('licensePlate') }}</label>
            <q-input dense id="license_plate" mask="XXX-XXX" max="7" :rules="[
              (val) => !!val || t('requiredField'),

            ]" outlined v-model="courier.courier_info.license_plate" placeholder="123-QWE"></q-input>
          </div>
          <div class="col-12 col-md-6" :class="{ 'q-pl-sm': $q.screen.gt.sm }">
            <label class="text-dark" for="licenseNumber">{{ t('licenseNumber') }}</label>
            <q-input dense id="licenseNumber" mask="##############" max="7" :rules="[
              (val) => !!val || t('requiredField'),

            ]" outlined v-model="courier.courier_info.driving_license_number" placeholder="151617181920"></q-input>
          </div>
          <div class="col-12">
            <label class="text-dark" for="contractType">{{ t('contractType') }}</label>
            <q-select emit-value map-options v-model="courier.courier_info.contract_type" id="contractType" :rules="[
              (val) => !!val || t('requiredField'),

            ]" outlined dense label="Selecciona una opción" :options="contractTypes"></q-select>
          </div>
          <div class="col-12 col-md-12" v-if="courier.courier_info.contract_type === 'per_delivery'">
            <label class="text-dark" for="amountByDelivery">{{ t('amountByDelivery') }}</label>
            <q-input dense id="amountByDelivery" mask="#############" :rules="[
              (val) => !!val || t('requiredField'),

            ]" outlined v-model="courier.courier_info.amount_by_delivery" placeholder="1.500"></q-input>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <div class="col-12 q-px-md d-flex content-between">
      <div class="div back-div">
        <q-btn unelevated outline @click="backTab" size="md" no-caps rounded v-if="tab !== 'access'" :label="t('back')"
          color="primary"></q-btn>
      </div>
      <q-btn v-if="tab === 'delivery'" :loading="loading" unelevated size="md" type="submit" no-caps rounded
        :label="t('save')" color="primary"></q-btn>
      <q-btn v-else unelevated @click="nextTab" size="md" no-caps rounded :label="t('next')" color="primary"></q-btn>
    </div>
  </q-form>
</template>

<script setup>
// imports
import { useI18n } from 'vue-i18n';
import { onBeforeMount, ref } from 'vue';
import { notification } from 'src/boot/notification';
import { couriersContent } from 'src/composables/couriersContent';

// props
const props = defineProps({
  courierSelected: {
    type: Object,
    default: () => { },
  }
});

// emits
const emit = defineEmits(['close-modal', 'up-total-item']);

// references
const courier = ref({
  type_user: 'delivery',
  profile: {},
  courier_info: {},
});
const { t } = useI18n();
const typeVehicles = [
  {
    label: t('bike'),
    value: 'bike'
  },
  {
    label: t('motorcycle'),
    value: 'motorcycle'
  },
  {
    label: t('car'),
    value: 'car'
  },
  {
    label: t('on_foot'),
    value: 'on_foot'
  },
  {
    label: t('scooter'),
    value: 'scooter'
  },
  {
    label: t('other'),
    value: 'other'
  },
];
const contractTypes = [
  {
    label: t('fixed'),
    value: 'fixed'
  },
  {
    label: t('per_delivery'),
    value: 'per_delivery'
  },
]; 
const tab = ref('access');
const loading = ref(false);
const content = couriersContent();

// computed


// methods
const handlerSaveCouriers = async () => {
  loading.value = true;

  if (courier.value._id) {
    await handlerUpdateCourier();
    return;
  }

  try {
    const response = await content.doCreateCourier(courier.value);
    if (response && response.success) {
      notification('success', t('courierCreateSuccess'), 'primary');
      emit('close-modal');
      emit('up-total-item');
    }
  } finally {
    loading.value = false;
  }
}

const handlerUpdateCourier = async () => {
  if (courier.value?.courier_info.amount_by_delivery) {
    courier.value.courier_info.amount_by_delivery = String(courier.value?.courier_info.amount_by_delivery);
  }

  try {
    const response = await content.doUpdateCourier(courier.value);
    if (response && response.success) {
      notification('success', t('courierUpdateSuccess'), 'primary');
      emit('close-modal');
    }
  } finally {
    loading.value = false;
  }
}

const nextTab = () => {
  if (tab.value === 'access') {
    tab.value = 'profile';
  } else if (tab.value === 'profile') {
    tab.value = 'delivery';
  }
}

const backTab = () => {
  if (tab.value === 'delivery') {
    tab.value = 'profile';
  } else if (tab.value === 'profile') {
    tab.value = 'access';
  }
}

// hook
onBeforeMount(() => {
  if (props.courierSelected && props.courierSelected._id) {
    courier.value = JSON.parse(JSON.stringify(props.courierSelected));
  }
});
</script>

<style scoped lang="scss"></style>
