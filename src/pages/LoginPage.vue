<template>
  <q-page class="auth-page">
    <div class="row window-height">
      <div class="col-12 col-md-5 full-height d-flex flex-center">
        <div class="auth-page__form-wrapper">
          <q-form class="auth-page__form-wrapper--form" @submit="handlerDoLogin">
            <div class="col-12 text-center">
              <img src="/images/logo.svg" class="auth-page__logo" alt=" Logo RepartiX">
            </div>
            <div class="col-12 q-mt-md">
              <label class="text-dark" for="username">{{ t('username') }}</label>
              <q-input id="username" :rules="[
                (val) => val.length > 0 || t('requiredField'),

              ]" outlined v-model="login.username" placeholder="jhondoe"></q-input>
            </div>
            <div class="col-12 q-mt-md">
              <label class="text-dark" for="password">{{ t('password') }}</label>
              <q-input id="password" :rules="[
                (val) => val.length > 0 || t('requiredField'),
                (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/.test(val) || t('passwordStrong')
              ]" type="password" outlined v-model="login.password" placeholder="*********"></q-input>
            </div>
            <div class="col-12 q-mt-md text-right">
              <q-btn no-caps color="dark" @click="recoveryPassword = !recoveryPassword" flat>
                {{ t('forgotPassword') }}
              </q-btn>
            </div>
            <div class="col-12 q-mt-xl">
              <q-btn no-caps type="submit" :loading="loading" size="lg" unelevated color="primary" rounded
                class="full-width" :label="t('signIn')"></q-btn>
            </div>
            <div class="col-12 text-center q-mt-md">
              <q-btn no-caps color="dark" flat to="/register">
                {{ t('dontHaveAccount') }}
              </q-btn>
            </div>
          </q-form>
        </div>
      </div>
      <div class="col-12 col-md-7">
        <img class="auth-page__img-bg" src="/images/login-bg.webp" alt="">
      </div>
    </div>

    <q-dialog v-model="recoveryPassword">
      <q-card class="auth-page__recovery-card">
        <q-card-section>
          <h2>
            <span v-if="!changePassword.token">{{ t('recoveryPassword') }}</span>
            <span v-else>{{ t('changePassword') }}</span>
            <q-btn v-close-popup flat dense icon="close" color="red" size="lg" rounded class="float-right">
              <q-tooltip class="bg-red">
                {{ t('close') }}
              </q-tooltip>
            </q-btn>
          </h2>
        </q-card-section>

        <q-card-section style="margin-top: -20px">
          <!--Recovery password form-->
          <q-form class="auth-page__form-wrapper--form" @submit="handlerRecoveryPassword" v-if="!changePassword.token">
            <div class="col-12">
              <label class="text-dark" for="email">{{ t('email') }}</label>
              <q-input id="email" :rules="[
                (val) => val.length > 0 || t('requiredField'),
                (val) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/.test(val) || t('invalidEmail')
              ]" outlined v-model="recovery.email" placeholder="jhon@doe.com"></q-input>
            </div>
            <div class="col-12 q-mt-md q-pb-md">
              <q-btn no-caps type="submit" :loading="loading" size="lg" unelevated color="primary" rounded
                class="full-width" :label="t('recoveryPassword')"></q-btn>
            </div>
          </q-form>
          <!--End recovery password form-->

          <!--Change password form-->
          <q-form class="auth-page__form-wrapper--form" @submit="handlerChangePassword" v-else>
            <div class="col-12">
              <label class="text-dark" for="email">{{ t('email') }}</label>
              <q-input id="email" :rules="[
                (val) => val.length > 0 || t('requiredField'),
                (val) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/.test(val) || t('invalidEmail')
              ]" outlined v-model="changePassword.email" placeholder="jhon@doe.com"></q-input>
            </div>
            <div class="col-12 q-mt-md">
              <label class="text-dark" for="passwordChange">{{ t('password') }}</label>
              <q-input id="passwordChange" :rules="[
                (val) => val.length > 0 || t('requiredField'),
                (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/.test(val) || t('passwordStrong')
              ]" type="password" outlined v-model="changePassword.password" placeholder="*********"></q-input>
            </div>
            <div class="col-12 q-mt-md">
              <label class="text-dark" for="password_confirm">{{ t('password_confirmation') }}</label>
              <q-input id="password_confirm" :rules="[
                (val) => val.length > 0 || t('requiredField'),
                (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/.test(val) || t('passwordStrong'),
                (val) => val === changePassword.password || t('dontMatchPassword')
              ]" type="password" outlined v-model="changePassword.confirmation_password"
                placeholder="*********"></q-input>
            </div>
            <div class="col-12 q-mt-md q-pb-md">
              <q-btn no-caps type="submit" :loading="loading" size="lg" unelevated color="primary" rounded
                class="full-width" :label="t('changePassword')"></q-btn>
            </div>
          </q-form>
          <!--End change password form-->
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
// imports
import { useI18n } from 'vue-i18n';
import { onBeforeMount, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { notification } from 'src/boot/notification';
import { authContent } from 'src/composables/authContent';

// references
const login = ref({
  username: '',
  password: ''
});
const recovery = ref({
  email: ''
});
const changePassword = ref({
  email: '',
  token: '',
  password: '',
  confirmation_password: ''
});
const { t } = useI18n();
const route = useRoute();
const loading = ref(false);
const router = useRouter();
const recoveryPassword = ref(false);
const { doLogin, doRecoveryPassword, doChangePassword } = authContent();

// methods
const handlerDoLogin = async () => {
  loading.value = true;
  try {
    const response = await doLogin(login.value);
    if (response?.user) {
      router.push('/dashboard');
    }
  } finally {
    loading.value = false;
  }
}

const handlerRecoveryPassword = async () => {
  loading.value = true;
  try {
    const response = await doRecoveryPassword(recovery.value);
    if (response?.success) {
      notification('positive', t('recoveryPasswordProccessInit'), 'primary');
      recoveryPassword.value = false;
      recovery.value = {
        email: ''
      }
    }
  } finally {
    loading.value = false;
  }
}

const handlerChangePassword = async () => {
  loading.value = true;
  try {
    const response = await doChangePassword(changePassword.value);
    if (response?.success) {
      notification('positive', t('changePasswordSuccess'), 'primary');
      recoveryPassword.value = false;
      changePassword.value = {
        email: '',
        token: '',
        password: '',
        confirmation_password: ''
      }
      router.push({
        path: '/',
        query: {}
      })
    }
  } finally {
    loading.value = false;
  }
}

// hook
onBeforeMount(() => {
  if (route.query.recovery_token) {
    recoveryPassword.value = true;
    changePassword.value.token = route.query.recovery_token;
  }
})
</script>
