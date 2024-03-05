import { defineStore } from 'pinia';
import { ProviderType } from '@/types/provider/ProviderListType';

export const ProviderStore = defineStore('providerStore', {
  state: () => ({
    selectedProvider: {
      id: '',
      name: '',
      isProvider: false,
      children: [],
    } as ProviderType,
    isChangedProvider: false,
  }),
  getters: {
    getSelectedProviderId(): string {
      return this.selectedProvider.id;
    },
    getSelectedProviderName(): string {
      return this.selectedProvider.name;
    },
    getSelectedProjectId(): string {
      if (this.isSelected) {
        return this.selectedProvider.children[0].id;
      } else {
        return '';
      }
    },
    getSelectedProjectName(): string {
      if (this.isSelected) {
        return this.selectedProvider.children[0].name;
      } else {
        return '';
      }
    },
    isSelected(): boolean {
      return !!this.selectedProvider.id;
    },
  },
  actions: {
    resetSelectedProvider() {
      this.selectedProvider = {} as ProviderType;
      this.isChangedProvider = false;
    },
    selectProvider(provider: ProviderType) {
      this.isChangedProvider = this.selectedProvider.id !== provider.id;
      this.selectedProvider = provider;
    },
  },
  // 로컬스토리지 사용
  persist: true,
});
