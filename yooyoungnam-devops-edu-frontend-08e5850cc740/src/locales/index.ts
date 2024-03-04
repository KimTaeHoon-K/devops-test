import { createI18n } from 'vue-i18n';

function loadLocaleMessages() {
  const locales = require.context('@/locales', true, /[A-Za-z0-9-_,\s]+\.ts$/i);
  const messages: any = {};
  locales.keys().forEach((key: string) => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = locales(key);
    }
  });
  return messages;
}

const index = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'english',
  fallbackLocale: 'english',
  messages: loadLocaleMessages(),
});

export default index;
