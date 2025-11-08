<template>
  <q-form @submit="handlerSaveUser" class="row">
    <q-tabs v-model="tab" no-caps dense class="text-primary full-width q-pa-none">
      <q-tab name="profile" :label="t('access')" />
      <q-tab name="scopes" :label="t('scopes')" />
    </q-tabs>
    <q-tab-panels class="full-width" v-model="tab" animated swipeable vertical transition-prev="jump-up" transition-next="jump-up">
      <q-tab-panel class="q-pa-none q-px-md" name="profile">
        <div class="row q-mt-md">
          <div class="col-12">
            <label class="text-dark" for="username">{{ t('username') }}</label>
            <q-input dense id="username" :rules="[
              (val) => !!val || t('requiredField'),

            ]" outlined v-model="user.username" placeholder="jhondoe"></q-input>
          </div>

          <div class="col-12 col-md-6" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
            <label class="text-dark" for="password">{{ t('password') }}</label>
            <q-input dense id="password" :rules="user._id ? [] : [
              (val) => !!val || t('requiredField'),
              (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/.test(val) || t('passwordStrong')
            ]" type="password" outlined v-model="user.password" placeholder="*********"></q-input>
          </div>

          <div class="col-12 col-md-6" :class="{ 'q-pl-sm': $q.screen.gt.sm }">
            <label class="text-dark" for="password_confirm">{{ t('password_confirmation') }}</label>
            <q-input dense id="password_confirm" :rules="user._id ? [] : [
              (val) => !!val || t('requiredField'),
              (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/.test(val) || t('passwordStrong'),
              (val) => val === user.password || t('dontMatchPassword')
            ]" type="password" outlined v-model="user.confirmation_password" placeholder="*********"></q-input>
          </div>

          <div class="col-12" :class="{ 'q-mt-md': user._id }">
            <label class="text-dark" for="email">{{ t('email') }}</label>
            <q-input dense id="email" :rules="[
              (val) => !!val || t('requiredField'),
              (val) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/.test(val) || t('invalidEmail')
            ]" outlined v-model="user.email" placeholder="jhon@doe.com"></q-input>
          </div>

          <div class="col-12">
            <label class="text-dark" for="full_name">{{ t('fullName') }}</label>
            <q-input dense id="full_name" :rules="[
              (val) => !!val || t('requiredField'),

            ]" outlined v-model="user.profile.full_name" placeholder="jhon Doe"></q-input>
          </div>
        </div>
      </q-tab-panel>

      <q-tab-panel class="q-pa-none q-px-md" name="scopes">
        <div class="row q-mt-md full-width">
          <div class="col-12">
            <q-input outlined dense :placeholder="t('search')" v-model="search"></q-input>
          </div>
          <div class="col-12 q-mt-md">
            <q-scroll-area style="width: 100%; height: 250px">
              <q-option-group v-model="user.scopes" type="checkbox" :options="scopesOptions" color="primary" inline />
            </q-scroll-area>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <div class="col-12 text-right">
      <q-btn v-if="tab === 'scopes'" :loading="loading" unelevated size="md" type="submit" no-caps rounded :label="t('save')"
        color="primary"></q-btn>
      <q-btn v-else unelevated @click="tab = 'scopes'" size="md" no-caps rounded :label="t('next')"
        color="primary"></q-btn>
    </div>
  </q-form>
</template>

<script setup>
// imports
import { useI18n } from 'vue-i18n';
import { onBeforeMount, ref, computed } from 'vue';
import { notification } from 'src/boot/notification';
import { usersContent } from 'src/composables/usersContent';

// props
const props = defineProps({
  userSelected: {
    type: Object,
    default: () => { },
  }
});

// emits
const emit = defineEmits(['close-modal', 'up-total-item']);

// references
const user = ref({
  type_user: 'employe',
  scopes: [],
  profile: {},
});
const search = ref('');
const { t } = useI18n();
const scopes = [
  {
    label: t('listUser'),
    value: 'list-user',
  },
  {
    label: t('createUser'),
    value: 'create-user',
  },
  {
    label: t('updateUser'),
    value: 'update-user',
  },
  {
    label: t('deleteUser'),
    value: 'delete-user',
  },
  {
    label: t('updateBrand'),
    value: 'update-brand',
  },
  {
    label: t('listCouriers'),
    value: 'list-couriers',
  },
  {
    label: t('createCouriers'),
    value: 'create-couriers',
  },
  {
    label: t('updateCouriers'),
    value: 'update-couriers',
  },
  {
    label: t('deleteCouriers'),
    value: 'delete-couriers',
  },
  {
    label: t('listCity'),
    value: 'list-city',
  },
  {
    label: t('createCity'),
    value: 'create-city',
  },
  {
    label: t('updateCity'),
    value: 'update-city',
  },
  {
    label: t('deleteCity'),
    value: 'delete-city',
  },
  {
    label: t('listClient'),
    value: 'list-client',
  },
  {
    label: t('createClient'),
    value: 'create-client',
  },
  {
    label: t('updateClient'),
    value: 'update-client',
  },
  {
    label: t('deleteClient'),
    value: 'delete-client',
  },
  {
    label: t('listSender'),
    value: 'list-sender',
  },
  {
    label: t('createSender'),
    value: 'create-sender',
  },
  {
    label: t('updateSender'),
    value: 'update-sender',
  },
  {
    label: t('deleteSender'),
    value: 'delete-sender',
  },
  {
    label: t('listOrder'),
    value: 'list-order',
  },
  {
    label: t('createOrder'),
    value: 'create-order',
  },
  {
    label: t('updateOrder'),
    value: 'update-order',
  },
  {
    label: t('deleteOrder'),
    value: 'delete-order',
  },
  {
    label: t('listShippingList'),
    value: 'list-shipping-list',
  },
  {
    label: t('createShippingList'),
    value: 'create-shipping-list',
  },
  {
    label: t('updateShippingList'),
    value: 'update-shipping-list',
  },
  {
    label: t('deleteShippingList'),
    value: 'delete-shipping-list',
  },
  {
    label: t('listReports'),
    value: 'list-reports',
  },
  {
    label: t('optimizeRoute'),
    value: 'optimize-route',
  },
  {
    label: t('listOptimizedRoute'),
    value: 'list-optimized-route',
  },
  {
    label: t('viewOptimizedRoute'),
    value: 'view-optimized-route',
  },
];
const tab = ref('profile');
const loading = ref(false);
const content = usersContent();

// computed
const scopesOptions = computed(() => {
  if (search.value) {
    return scopes.filter(scope => scope.label.toLowerCase().includes(search.value.toLowerCase()));
  }
  return scopes;
});


// methods
const handlerSaveUser = async () => {
  loading.value = true;
  delete user.value.__v;

  if (user.value._id) {
    await handlerUpdateUser();
    return;
  }

  try {
    const response = await content.doCreateUser(user.value);
    if (response && response.success) {
      notification('success', t('userCreateSuccess'), 'primary');
      emit('close-modal');
      emit('up-total-item');
    }
  } finally {
    loading.value = false;
  }
}

const handlerUpdateUser = async () => {
  try {
    const response = await content.doUpdateUser(user.value);
    if (response && response.success) {
      notification('success', t('userUpdateSuccess'), 'primary');
      emit('close-modal');
    }
  } finally {
    loading.value = false;
  }
}

// hook
onBeforeMount(() => {
  if (props.userSelected && props.userSelected._id) {
    user.value = JSON.parse(JSON.stringify(props.userSelected));
  }
});
</script>
