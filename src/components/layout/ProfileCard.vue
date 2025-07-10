<template>
  <q-card class="profile-card">
    <!--Header-->
    <q-card-section>
      <p class="text-bold text-h5">
        {{ t('configuration') }}
      </p>
      <q-btn v-close-popup icon="close" class="text-red close-btn absolute-top-right" flat dense rounded>
        <q-tooltip class="bg-red">
          {{ t('close') }}
        </q-tooltip>
      </q-btn>
    </q-card-section>
    <!--End header-->

    <!--Body-->
    <q-card-section style="margin-top: -10px">
      <q-splitter disable v-model="splitterModel" style="height: 350px">
        <!--Tabs-->
        <template v-slot:before>
          <q-tabs v-model="tab" no-caps vertical class="text-primary">
            <q-tab name="profile" icon="person" :label="t('profile')" />
            <q-tab name="map" icon="explore" :label="t('map')" />
            <q-tab name="configuration" icon="admin_panel_settings" :label="t('configuration')" />
          </q-tabs>
        </template>
        <!--End tabs-->

        <!--Body tabs-->
        <template v-slot:after>
          <q-tab-panels v-model="tab" animated swipeable vertical transition-prev="jump-up" transition-next="jump-up">
            <!--Profile tab-->
            <q-tab-panel class="q-pa-none q-px-md" name="profile">
              <q-tabs class="q-pa-none" no-caps v-model="profileTab">
                <q-tab name="access" :label="t('access')" />
                <q-tab name="profile" :label="t('profile')" />
                <q-tab name="brand" :label="t('brand')" />
              </q-tabs>

              <!--Tab de perfil-->
              <q-tab-panels v-model="profileTab" animated swipeable vertical transition-prev="jump-up">
                <!--Tab de acceso-->
                <q-tab-panel name="access">
                  <q-form @submit="handlerSaveAccess" class="row">
                    <div class="col-12 col-md-6" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
                      <label class="text-dark" for="username">{{ t('username') }}</label>
                      <q-input id="username" :rules="[
                        (val) => val.length > 0 || t('requiredField'),

                      ]" outlined v-model="user.username" placeholder="jhondoe"></q-input>
                    </div>
                    <div class="col-12 col-md-6" :class="{ 'q-pl-sm': $q.screen.gt.sm }">
                      <label class="text-dark" for="password">{{ t('password') }}</label>
                      <q-input id="password" type="password" outlined v-model="user.password"
                        placeholder="*********"></q-input>
                    </div>
                    <div class="col-12" :class="{'q-mt-md': $q.screen.lt.md}">
                      <label class="text-dark" for="password">{{ t('email') }}</label>
                      <q-input id="email" :rules="[
                        (val) => val.length > 0 || t('requiredField'),
                        (val) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/.test(val) || t('invalidEmail')
                      ]" outlined v-model="user.email" placeholder="jhon@doe.com"></q-input>
                    </div>
                    <div class="col-12 text-right q-mt-md">
                      <q-btn :loading="loading" unelevated size="md" type="submit" no-caps rounded :label="t('save')" color="primary"></q-btn>
                    </div>
                  </q-form>
                </q-tab-panel>
                <!--End tab de acceso-->
              </q-tab-panels>
              <!--End tab de perfil-->
            </q-tab-panel>
            <!--End profile tab-->
          </q-tab-panels>
        </template>
        <!--End body tabs-->
      </q-splitter>
    </q-card-section>
    <!--End body-->
  </q-card>
</template>

<script setup>
// improts
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { useAuthStore } from 'src/stores/authStore';
import { authContent } from 'src/composables/authContent';
import { notification } from 'src/boot/notification';

// references
const { t } = useI18n();
const loading = ref(false);
const tab = ref('profile');
const store = useAuthStore();
const splitterModel = ref(25);
const authApi = authContent();
const profileTab = ref('access');

// computed
const user = computed(() => {
  return store.getUser;
});

// methods
const handlerSaveAccess = async () => {
  loading.value = true;
  const { username, email, password } = user.value;
  try {
    let params = {
      username,
      email,
    }
    if (password) params.password = password;
    const response = await authApi.doUpdateCredentials(params);
    if (response && response.success) {
      notification('success', t('changeCredentialSuccess'), 'primary');
    }
  } finally{
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.profile-card {
  max-width: 700px;
  width: 100%;

  .close-btn {
    right: 10px;
    top: 15px;
  }

  .title {
    font-size: 1rem;
  }

  // media queries
}
</style>
