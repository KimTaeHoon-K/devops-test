<template>
  <div class="breadcrumb">
    <a-breadcrumb>
      <a-breadcrumb-item
        v-for="(matched, idx) in route.matched"
        v-bind:key="idx"
      >
        <template v-if="matched.components">
          <a @click="goPage(matched.path)">
            <!-- TODO: router 파일에 meta.title 정의 되면 주석 처리해둔 코드로 바꿀 예정 -->
            <!--            {{ t(matched.meta?.title) }}-->
            {{
              matched.meta?.title ? t(matched.meta?.title) : matched.meta?.title
            }}
          </a>
        </template>
        <template v-else-if="!matched.components">
          {{
            matched.meta?.title ? t(matched.meta?.title) : matched.meta?.title
          }}
        </template>
      </a-breadcrumb-item>
    </a-breadcrumb>
  </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';

const route = useRoute();
const router = useRouter();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const goPage = (to: string) => {
  router.push(to);
};
</script>

<style scoped></style>
