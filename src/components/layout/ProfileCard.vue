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
      <q-splitter disable v-model="splitterModel" style="height: 390px">
        <!--Tabs-->
        <template v-slot:before>
          <q-tabs v-model="tab" no-caps vertical class="text-primary">
            <q-tab name="profile" icon="person" :label="t('profile')" />
            <q-tab v-if="utils.validateRole('update-brand')" name="map" icon="explore" :label="t('map')" />
            <q-tab v-if="utils.validateRole('update-brand')" name="configuration" icon="admin_panel_settings" :label="t('configuration')" />
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
                <q-tab v-if="utils.validateRole('update-brand')" name="brand" :label="t('brand')" />
              </q-tabs>

              <!--Tab de perfil-->
              <q-tab-panels v-model="profileTab" animated swipeable vertical transition-prev="jump-up">
                <!--Tab de acceso-->
                <q-tab-panel name="access">
                  <!--Formulario de acceso-->
                  <q-form @submit="handlerSaveAccess" class="row">
                    <div class="col-12 col-md-6" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
                      <label class="text-dark" for="username">{{ t('username') }}</label>
                      <q-input dense :readonly="!edit" id="username" :rules="[
                        (val) => val.length > 0 || t('requiredField'),

                      ]" outlined v-model="user.username" placeholder="jhondoe"></q-input>
                    </div>
                    <div class="col-12 col-md-6" :class="{ 'q-pl-sm': $q.screen.gt.sm }">
                      <label class="text-dark" for="password">{{ t('password') }}</label>
                      <q-input dense :readonly="!edit" id="password" type="password" outlined v-model="user.password"
                        placeholder="*********"></q-input>
                    </div>
                    <div class="col-12" :class="{ 'q-mt-md': $q.screen.lt.md }">
                      <label class="text-dark" for="password">{{ t('email') }}</label>
                      <q-input dense :readonly="!edit" id="email" :rules="[
                        (val) => val.length > 0 || t('requiredField'),
                        (val) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/.test(val) || t('invalidEmail')
                      ]" outlined v-model="user.email" placeholder="jhon@doe.com"></q-input>
                    </div>
                    <div class="col-12 text-right q-mt-md">
                      <q-btn v-if="edit" :loading="loading" unelevated size="md" type="submit" no-caps rounded
                        :label="t('save')" color="primary"></q-btn>
                      <q-btn no-caps v-else unelevated size="md" rounded :label="t('edit')" color="primary"
                        @click="edit = !edit"></q-btn>
                    </div>
                  </q-form>
                  <!--End formulario acceso-->
                </q-tab-panel>
                <!--End tab de acceso-->

                <!--Tab profile-->
                <q-tab-panel name="profile">
                  <q-form @submit="handlerSaveProfile" class="row">
                    <div class="col-12 col-md-12" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
                      <label class="text-dark" for="full_name">{{ t('fullName') }}</label>
                      <q-input dense :readonly="!edit" id="full_name" :rules="[
                        (val) => val.length > 0 || t('requiredField'),

                      ]" outlined v-model="user.profile.full_name" placeholder="Jhon Doe"></q-input>
                    </div>
                    <div class="col-12 col-md-12" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
                      <label class="text-dark" for="address">{{ t('address') }}</label>
                      <q-input dense :readonly="!edit" id="address" :rules="[
                        (val) => val.length > 0 || t('requiredField'),

                      ]" outlined v-model="user.profile.address" placeholder="Carrera 81"></q-input>
                    </div>
                    <div class="col-12 col-md-6" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
                      <label class="text-dark" for="phone">{{ t('phone') }}</label>
                      <q-input mask="+## ##########" dense :readonly="!edit" id="phone" :rules="[
                        (val) => val.length > 0 || t('requiredField'),
                        (val) => /^\+\d{1,3} ?\d{7,12}$/.test(val) || t('invalidPhone'),
                      ]" outlined v-model="user.profile.phone" placeholder="3225361689">
                        <template #prepend>
                          <span>
                            {{ flagFromPhoneNumber }}
                            <q-menu v-if="edit" max-height="130px">
                              <q-list dense class="q-pa-none">
                                <q-item clickable @click="setDial(country)" v-for="(country, idx) in americanPhoneCodes" :key="idx">
                                  {{ country.flag }}
                                </q-item>
                              </q-list>
                            </q-menu>
                          </span>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6" :class="{ 'q-pl-sm': $q.screen.gt.sm }">
                      <label class="text-dark" for="age">{{ t('age') }}</label>
                      <q-input dense :readonly="!edit" id="age" type="number" outlined maxlength="99" v-model="user.profile.age"
                        placeholder="18"></q-input>
                    </div>
                    <div class="col-12 text-right q-mt-md">
                      <q-btn v-if="edit" :loading="loading" unelevated size="md" type="submit" no-caps rounded
                        :label="t('save')" color="primary"></q-btn>
                      <q-btn no-caps v-else unelevated size="md" rounded :label="t('edit')" color="primary"
                        @click="edit = !edit"></q-btn>
                    </div>
                  </q-form>
                </q-tab-panel>
                <!--End tab profile-->

                <!--Tab brand-->
                <q-tab-panel name="brand">
                  <q-form @submit="handlerSaveBrand" class="row">
                    <div class="col-12 col-md-12" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
                      <label class="text-dark" for="brandName">{{ t('brandName') }}</label>
                      <q-input dense :readonly="!edit" id="brandName" :rules="[
                        (val) => val.length > 0 || t('requiredField'),

                      ]" outlined v-model="user.brand.name" placeholder="RepartiX"></q-input>
                    </div>
                    <div class="col-12 col-md-6" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
                      <label class="text-dark" for="phone">{{ t('phone') }}</label>
                      <q-input maxlength="60" dense :readonly="!edit" id="phone" :rules="[
                        (val) => val.length > 0 || t('requiredField'),
                        (val) => /^\+\d{1,3} ?\d{7,12}$/.test(val) || t('invalidPhone'),
                      ]" outlined v-model="user.brand.phone" placeholder="3225361689">
                        <template #prepend>
                          <span>
                            {{ flagFromPhoneNumber }}
                            <q-menu v-if="edit" max-height="130px">
                              <q-list dense class="q-pa-none">
                                <q-item clickable @click="setDial(country, 'brand')" v-for="(country, idx) in americanPhoneCodes" :key="idx">
                                  {{ country.flag }}
                                </q-item>
                              </q-list>
                            </q-menu>
                          </span>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6" :class="{ 'q-pl-sm': $q.screen.gt.sm }">
                      <label class="text-dark" for="rut">{{ t('rut') }}</label>
                      <q-input dense :readonly="!edit" id="rut" type="string" outlined maxlength="20" v-model="user.brand.rut"
                        placeholder="182536984-2"></q-input>
                    </div>
                    <div class="col-12 col-md-12" :class="{ 'q-pr-sm': $q.screen.gt.sm }">
                      <label class="text-dark" for="address">{{ t('address') }}</label>
                      <q-input maxlength="90" dense :readonly="!edit" id="address" :rules="[
                        (val) => val.length > 0 || t('requiredField'),

                      ]" outlined v-model="user.brand.address" placeholder="Carrera 81"></q-input>
                    </div>
                    <div class="col-12 text-right q-mt-md">
                      <q-btn v-if="edit" :loading="loading" unelevated size="md" type="submit" no-caps rounded
                        :label="t('save')" color="primary"></q-btn>
                      <q-btn no-caps v-else unelevated size="md" rounded :label="t('edit')" color="primary"
                        @click="edit = !edit"></q-btn>
                    </div>
                  </q-form>
                </q-tab-panel>
                <!--End tab brand-->
              </q-tab-panels>
              <!--End tab de perfil-->
            </q-tab-panel>
            <!--End profile tab-->

            <!--Map tab-->
            <q-tab-panel class="q-pa-none q-px-md" name="map">
              <MapConfiguration />
            </q-tab-panel>
            <!--End map tab-->

            <!--Configuration tab-->
            <q-tab-panel class="q-pa-none q-px-md" name="configuration">
              <ConfigComponent />
            </q-tab-panel>
            <!--End Configuration tab-->
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
import { Utils } from 'src/utils/utils';
import { computed, ref, watch } from 'vue';
import { useAuthStore } from 'src/stores/authStore';
import { notification } from 'src/boot/notification';
import { americanPhoneCodes } from 'src/utils/constant';
import { authContent } from 'src/composables/authContent';
import ConfigComponent from './configurations/ConfigComponent.vue';
import MapConfiguration from './configurations/MapConfiguration.vue';

// references
const edit = ref(false);
const { t } = useI18n();
const utils = new Utils();
const loading = ref(false);
const tab = ref('profile');
const store = useAuthStore();
const splitterModel = ref(25);
const authApi = authContent();
const selectedFlag = ref('🇨🇴');
const selectedDial = ref('+57');
const profileTab = ref('access');


// computed
const user = computed(() => {
  const userData = store.getUser;
  if (!userData.profile) {
    userData.profile = {};
  }

  if (!userData.brand) {
    userData.brand = {};
  }

  return userData;
});

const flagFromPhoneNumber = computed(() => {
  let flag = '';
  if (user.value.profile && user.value.profile.phone) {
    let dial = user.value.profile.phone.split(' ').shift();
    if (profileTab.value === 'brand' && user.value.brand && user.value.brand.phone) {
      dial = user.value.brand.phone.split(' ').shift();
    }

    if (!dial) selectedFlag;

    const country = americanPhoneCodes.find((el) => el.code === dial);
    if (country) {
      flag = country.flag || '';
    }
  } 

  return flag || selectedFlag.value;
}); 

// watch
watch(profileTab, () => {
  if (edit.value) edit.value = false;
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
      edit.value = !edit.value;
      notification('success', t('changeCredentialSuccess'), 'primary');
    }
  } finally {
    loading.value = false;
  }
}

const setDial = (country, type = 'profile') => {
  selectedDial.value = country.code;
  selectedFlag.value = country.flag;
  const phone = user.value.profile.phone.split(' ').pop() || '';
  type === 'profule' ?
    user.value.profile.phone = `${country.code} ${phone}` :
    user.value.brand.phone = `${country.code} ${phone}`;
}

const handlerSaveProfile = async () => {
  loading.value = true;
  const { full_name, address, phone, age } = user.value.profile;
  try {
    let params = {
      full_name,
      address,
      phone,
    }
    if (age) params.age = parseInt(age);
    const response = await authApi.doUpdateProfile(params);
    if (response && response.success) {
      edit.value = !edit.value;
      notification('success', t('changeProfileSuccess'), 'primary');
    }
  } finally {
    loading.value = false;
  }
}

const handlerSaveBrand = async () => {
  loading.value = true;
  const { name, rut, phone, address } = user.value.brand;
  try {
    let params = {
      name,
      address,
      phone,
      rut,
    }
    const response = await authApi.doUpdateBrand(params);
    if (response && response.success) {
      edit.value = !edit.value;
      notification('success', t('changeBrandSuccess'), 'primary');
    }
  } finally {
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
