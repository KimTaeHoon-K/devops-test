<template>
  <div class="lnb-wrapper">
    <a-button type="default" class="button-toggle" @click="toggleCollapsed">
      <MenuUnfoldOutlined v-if="collapsed" />
      <MenuFoldOutlined v-else />
    </a-button>
    <TenantNavigator v-model="showProviderModal" />
    <ProviderSelectModal
      v-if="showProviderModal"
      v-model="showProviderModal"
      :show-modal="showProviderModal"
    />
    <a-menu
      :openKeys="openKeys"
      v-model:selectedKeys="selectedKeys"
      @openChange="onOpenChange"
      mode="inline"
      :inline-collapsed="collapsed"
    >
      <template v-for="menuItem in menuItems" v-bind:key="menuItem.key">
        <template v-if="!menuItem.subMenuItems">
          <a-menu-item :key="menuItem.key" class="menu-first">
            <template #icon>
              <template v-if="menuItem.meta?.icon === 'icon-dashboard'">
                <layout-outlined />
              </template>
              <template v-else-if="menuItem.meta?.icon === 'icon-setting'">
                <setting-outlined />
              </template>
            </template>
            <router-link :to="menuItem.link">
              {{ t(menuItem?.meta?.title) }}
            </router-link>
          </a-menu-item>
        </template>

        <template v-if="menuItem.subMenuItems">
          <a-sub-menu :key="menuItem.key" class="menu-first">
            <template #icon>
              <template v-if="menuItem.meta?.icon === 'icon-compute'">
                <desktop-outlined />
              </template>
              <template v-else-if="menuItem.meta?.icon === 'icon-storage'">
                <hdd-outlined />
              </template>
              <template v-else-if="menuItem.meta?.icon === 'icon-network'">
                <global-outlined />
              </template>
              <template v-else-if="menuItem.meta?.icon === 'icon-management'">
                <setting-outlined />
              </template>
            </template>
            <template #title> {{ t(menuItem?.meta?.title) }}</template>
            <template
              v-for="subMenuItem in menuItem.subMenuItems"
              v-bind:key="subMenuItem.key"
            >
              <template v-if="!subMenuItem.subMenuItems">
                <a-menu-item :key="subMenuItem.key" class="menu-second">
                  <template #icon>
                    <span class="icon-dot"><span></span></span>
                  </template>
                  <router-link :to="subMenuItem.link">
                    {{ t(subMenuItem?.meta?.title) }}
                  </router-link>
                </a-menu-item>
              </template>

              <template v-if="subMenuItem.subMenuItems">
                <a-sub-menu :key="subMenuItem.key" class="menu-second">
                  <template #title>{{ subMenuItem.title }}</template>
                  <template
                    v-for="thirdMenuItem in subMenuItem.subMenuItems"
                    v-bind:key="thirdMenuItem.key"
                  >
                    <template v-if="!thirdMenuItem.subMenuItems">
                      <a-menu-item :key="thirdMenuItem.key" class="menu-third">
                        <router-link :to="thirdMenuItem.link"
                          >{{ thirdMenuItem.title }}
                        </router-link>
                      </a-menu-item>
                    </template>

                    <template v-if="thirdMenuItem.subMenuItems">
                      <a-sub-menu class="menu-third">
                        <template #title>{{ thirdMenuItem.title }}</template>
                        <div
                          v-for="forthMenuItem in thirdMenuItem.subMenuItems"
                          v-bind:key="forthMenuItem.key"
                        >
                          <a-menu-item :key="forthMenuItem.key">
                            <router-link :to="forthMenuItem.link"
                              >{{ forthMenuItem.title }}
                            </router-link>
                          </a-menu-item>
                        </div>
                      </a-sub-menu>
                    </template>
                  </template>
                </a-sub-menu>
              </template>
            </template>
          </a-sub-menu>
        </template>
      </template>
    </a-menu>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, toRefs, watch, onMounted } from 'vue';
import {
  DesktopOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  LayoutOutlined,
  HddOutlined,
  GlobalOutlined,
} from '@ant-design/icons-vue';
import { MenuType } from '@/types/navigations/MenuType';
import { useI18n } from 'vue-i18n';
import ko from '@/locales/lang/ko';
import en from '@/locales/lang/en';
import MenuItemList from '@/assets/data/MenuItemList.json';
import TenantNavigator from '@/components/navigations/TenantNavigator';
import ProviderSelectModal from '@/components/modal/ProviderSelectModal.vue';
import { ProviderStore } from '@/stores/provider/ProviderStore';

const showProviderModal = ref<boolean>(false);

const menuItems = ref<MenuType[]>(MenuItemList);

const selectedMenu = reactive({
  rootSubmenuKeys: [] as string[],
  openKeys: [] as string[],
  selectedKeys: [] as string[],
});

selectedMenu.selectedKeys = [menuItems.value[0].key];

const { t, locale } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

watch(locale, (newLocale: any) => {
  localStorage.setItem('locale', newLocale);
});

const { rootSubmenuKeys, openKeys, selectedKeys } = toRefs(selectedMenu);

const onOpenChange = (openKeys: string[]) => {
  const latestOpenKey = openKeys.find(
    (key) => selectedMenu.openKeys.indexOf(key) === -1
  );
  if (selectedMenu.rootSubmenuKeys.indexOf(latestOpenKey!) === -1) {
    selectedMenu.openKeys = [...openKeys];
  } else {
    selectedMenu.openKeys = latestOpenKey ? [latestOpenKey] : [];
  }
};

//toggle lnb fold
const collapsed = ref<boolean>(false);

const toggleCollapsed = () => {
  collapsed.value = !collapsed.value;
};

const providerStore = ProviderStore();
const checkProvider = () => {
  if (providerStore.isSelected) {
    providerStore.resetSelectedProvider();
  }
  showProviderModal.value = true;
};

onMounted(() => {
  checkProvider();
});
</script>
