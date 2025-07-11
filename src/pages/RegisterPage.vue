<template>
  <q-page class="register-page">
    <div class="row window-height">
      <div class="col-12 col-md-7">
        <img class="register-page__img-bg" src="/images/login-bg.webp" alt="">
      </div>
      <div class="col-12 col-md-5 full-height d-flex flex-center">
        <div class="register-page__form-wrapper">
          <q-form class="register-page__form-wrapper--form" @submit="handlerDoSigUp">
            <div class="col-12 text-center">
              <img src="/images/logo.svg" class="register-page__logo" alt=" Logo RepartiX">
            </div>
            <div class="col-12 q-mt-md">
              <label class="text-dark" for="username">{{ t('username') }}</label>
              <q-input dense id="username" :rules="[
                (val) => val.length > 0 || t('requiredField'),

              ]" outlined v-model="login.username" placeholder="jhondoe"></q-input>
            </div>
            <div class="col-12 q-mt-md">
              <label class="text-dark" for="email">{{ t('email') }}</label>
              <q-input dense id="email" :rules="[
                (val) => val.length > 0 || t('requiredField'),
                (val) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/.test(val) || t('invalidEmail')
              ]" outlined v-model="login.email" placeholder="jhon@doe.com"></q-input>
            </div>
            <div class="col-12 q-mt-md">
              <label class="text-dark" for="password">{{ t('password') }}</label>
              <q-input dense id="password" :rules="[
                (val) => val.length > 0 || t('requiredField'),
                (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/.test(val) || t('passwordStrong')
              ]" type="password" outlined v-model="login.password" placeholder="*********"></q-input>
            </div>
            <div class="col-12 q-mt-md">
              <label class="text-dark" for="password_confirm">{{ t('password_confirmation') }}</label>
              <q-input dense id="password_confirm" :rules="[
                (val) => val.length > 0 || t('requiredField'),
                (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/.test(val) || t('passwordStrong'),
                (val) => val === login.password || t('dontMatchPassword')
              ]" type="password" outlined v-model="login.confirmation_password" placeholder="*********"></q-input>
            </div>
            <div class="col-12 q-mt-md text-center">
              <q-btn no-caps type="submit" :loading="loading" size="md" unelevated color="primary" rounded
                :label="t('signUp')"></q-btn>
            </div>
            <div class="col-12 text-center q-mt-md">
              <q-btn no-caps color="dark" flat to="/">
                {{ t('readyHaveAccount') }}
              </q-btn>
            </div>
          </q-form>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
// imports
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { authContent } from 'src/composables/authContent';
import { useRouter } from 'vue-router';
import { notification } from 'src/boot/notification';

// references
const login = ref({
  username: '',
  password: '',
  confirmation_password: '',
  email: ''
});
const { t } = useI18n();
const loading = ref(false);
const router = useRouter();
const { doSignUp } = authContent();

// methods
const handlerDoSigUp = async () => {
  loading.value = true;
  try {
    const response = await doSignUp(JSON.parse(JSON.stringify(login.value)));
    if (response?.token) {
      login.value = {
        username: '',
        password: '',
        confirmation_password: '',
        email: ''
      }
      notification('positive', t('successSignUp'), 'primary')
      router.push('/');
    }
  } finally {
    loading.value = false;
  }
}
</script>
