<template>
  <q-card class="plans-card">
    <!--Header-->
    <q-card-section>
      <p class="text-bold text-h5">
        {{ t('planCardTitle') }}
      </p>
      <q-btn v-close-popup icon="close" class="text-red close-btn absolute-top-right" flat dense rounded>
        <q-tooltip class="bg-red">
          {{ t('close') }}
        </q-tooltip>
      </q-btn>
    </q-card-section>
    <!--End header-->

    <!--plans grids-->
    <q-card-section style="margin-top: -10px">
      <div class="row">
        <div class="col-12 col-sm-4" v-for="(plan, idx) in plans" :key="idx"
          :class="{ 'q-pr-sm': $q.screen.gt.xs && idx === 0, 'q-px-sm': $q.screen.gt.xs && idx === 1, 'q-pl-sm': $q.screen.gt.xs && idx === 2, 'q-mt-lg': $q.screen.lt.sm && idx > 0 }">
          <q-card flat bordered class="plan-card">
            <q-card-section class="plan-title-description">
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-h6 text-primary">{{ t(plan.name) }}</div>
                  <div class="text-subtitle2" :title="t(plan.description)">
                    <p>{{ t(plan.description) }}</p>
                  </div>
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <q-list class="dense q-pa-none">
                <q-item class="q-pa-none" v-for="(usability, idxUsabilities) in plan?.usabilities"
                  :key="idxUsabilities">
                  <q-item-section>
                    <q-item-label class="text-bold text-primary">
                      {{ t(usability.name) }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side class="text-bold">
                    {{ usability.count }}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>

            <q-tabs v-model="period" class="text-primary">
              <q-tab :label="t('month')" name="month" />
              <q-tab :label="t('year')" name="year" />
            </q-tabs>
            <q-separator />

            <q-card-actions class="d-flex justify-between">
              <q-tab-panels v-model="period" animated>
                <q-tab-panel name="month" class="q-pa-xs bg-transparent">
                  <span class="text-bold text-h6 text-primary">{{ t('price') }} ${{ plan.price }}</span>
                </q-tab-panel>
        
                <q-tab-panel name="year" class="q-pa-xs bg-transparent">
                  <span class="text-bold text-h6 text-primary">{{ t('price') }} ${{ plan.price_year }}</span>
                </q-tab-panel>
              </q-tab-panels>
              <q-btn @click="handlerDoSubscription(plan)" round color="primary" icon="card_membership" flat dense>
                <q-tooltip class="bg-primary">
                  {{ t('subscribe') }}
                </q-tooltip>
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </q-card-section>
    <!--End plans grid-->
  </q-card>
</template>

<script setup>
//imports
import { useI18n } from 'vue-i18n';
import { useQuasar, Loading } from 'quasar';
import { computed, onBeforeMount, ref } from 'vue';
import { useAuthStore } from 'src/stores/authStore';
import { usePlansContent } from 'src/composables/plansContent';
import { notification } from 'src/boot/notification';

// references
const q = useQuasar();
const { t } = useI18n();
const period = ref('month');
const store = useAuthStore();
const { plans, loadPlans, doSubscription } = usePlansContent();

// computed
const user = computed(() => store.getUser);

// emits
const emit = defineEmits(['close-modal']);

// methods
const handlerDoSubscription = (plan) => {
  q.dialog({
    title: t('subscriptionTitle'),
    message: `${t('subscriptionDescription')} ${t(plan.name)}?`,
    cancel: true,
  }).onOk(() => {
    confirmSubscription(plan)
  });
};

const confirmSubscription = async (plan) => {
  const params = {
    plan_id: plan._id,
    period: period.value,
    paymentMethods: "mercadopago",
    user: {
      _id: user.value._id,
      username: user.value.username,
      email: user.value.email,
    },
  };
  try {
    Loading.show({
      spinnerColor: 'primary',
      spinnerSize: 140,
      backgroundColor: 'secondary',
    });
    const response = await doSubscription(params);
    if (response.success) {
      notification('success', `${t('success_subscription')} ${t(plan.name)}`, 'primary');
      emit('close-modal');
    }
  } finally {
    Loading.hide();
  }
}

// hook
onBeforeMount(async () => {
  await loadPlans();
});
</script>

<style scoped lang="scss">
.plans-card {
  max-width: 740px;
  width: 100%;

  .plan-title-description {
    height: 140px;

    p {
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  @media(width < 768px) {
    max-width: 100%;
  }
}

.close-btn {
  right: 10px;
  top: 15px;
}
</style>
