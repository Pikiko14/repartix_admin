<template>
  <q-form @submit="handlerSaveUser" class="row">
    <div class="col-12">
      <label class="text-dark" for="username">{{ t('username') }}</label>
      <q-input dense id="username" :rules="[
        (val) => !!val || t('requiredField'),

      ]" outlined v-model="user.username" placeholder="jhondoe"></q-input>
    </div>

    <div class="col-12 col-md-6" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
      <label class="text-dark" for="password">{{ t('password') }}</label>
      <q-input dense id="password" :rules="user._id ? [] :[
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

    <div class="col-12" :class="{'q-mt-md': user._id}">
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

    <div class="col-12">
      <label class="text-dark" for="scopes">{{ t('scopes') }}</label>
      <q-option-group v-model="user.scopes" type="checkbox" :options="scopes" color="primary" inline />
    </div>

    <div class="col-12 text-right">
      <q-btn :loading="loading" unelevated size="md" type="submit" no-caps rounded :label="t('save')"
        color="primary"></q-btn>
    </div>
  </q-form>
</template>

<script setup>
// imports
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { notification } from 'src/boot/notification';
import { usersContent } from 'src/composables/usersContent';

// props
const props = defineProps({
  userSelected: {
    type: Object,
    default: () => {},
  }
});

// references
const user = ref({
  type_user: 'employe',
  scopes: [],
  profile: {},
});
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
];
const loading = ref(false);
const content = usersContent();

// emits
const emit = defineEmits(['close-modal']);

// methods
const handlerSaveUser = async () => {
  loading.value = true;
  
  if (user.value._id) {
    await handlerUpdateUser();
    return;
  }

  try {
    const response = await content.doCreateUser(user.value);
    if (response && response.success) {
      notification('success', t('userCreateSuccess'), 'primary');
      emit('close-modal');
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
