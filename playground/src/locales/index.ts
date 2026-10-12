import en from './en'
import ja from './ja'
import ko from './ko'
import zhCN from './zh-CN'
import zhTW from './zh-TW'

export const messages = {
  en,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  ja,
  ko,
}

export type PlaygroundLocale = keyof typeof messages

export const languages = [
  {
    value: 'zh-CN',
    label: '简体中文',
  },
  {
    value: 'zh-TW',
    label: '繁體中文',
  },
  {
    value: 'en',
    label: 'English',
  },
  {
    value: 'ja',
    label: '日本語',
  },
  {
    value: 'ko',
    label: '한국어',
  },
] as const satisfies readonly { value: PlaygroundLocale; label: string }[]

export function resolveLocale(value: string): PlaygroundLocale {
  return languages.find(language => language.value === value)?.value ?? 'zh-CN'
}
