<script setup lang="ts">
import {
  BookOpen,
  CodeXml,
  Globe,
  Menu,
  Monitor,
  Moon,
  Play,
  Sun,
} from '@lucide/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePreferences } from '../composables/usePreferences'
import { languages } from '../locales'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const emit = defineEmits<{ openNavigation: [] }>()
const { t: translate } = useI18n()
const { language, theme } = usePreferences()
const languageLabel = computed(
  () => languages.find(option => option.value === language.value)?.label,
)
</script>

<template>
  <header
    class="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background px-3 sm:px-5"
  >
    <div class="flex min-w-0 items-center gap-2 sm:gap-3">
      <Button
        size="icon-sm"
        variant="ghost"
        class="lg:hidden"
        :aria-label="translate('app.examples')"
        @click="emit('openNavigation')"
        ><Menu
      /></Button>
      <a
        href="./"
        class="flex items-center gap-2 text-lg font-semibold tracking-tight"
        ><Play class="size-6 fill-current" />videojs-vue</a
      >
      <Badge
        variant="secondary"
        class="hidden font-normal sm:inline-flex"
        >Playground</Badge
      >
    </div>
    <div class="flex items-center gap-1">
      <Button
        as-child
        variant="ghost"
        size="sm"
        class="hidden sm:inline-flex"
        ><a
          href="https://github.com/ntnyq/videojs-vue/tree/main/docs"
          target="_blank"
          rel="noreferrer"
          ><BookOpen />{{ translate('app.docs') }}</a
        ></Button
      >
      <Button
        as-child
        variant="ghost"
        size="icon-sm"
        aria-label="GitHub"
        ><a
          href="https://github.com/ntnyq/videojs-vue"
          target="_blank"
          rel="noreferrer"
          ><CodeXml /></a
      ></Button>
      <DropdownMenu>
        <DropdownMenuTrigger as-child
          ><Button
            variant="ghost"
            size="sm"
            :aria-label="translate('app.language')"
            ><Globe /><span class="hidden sm:inline">{{
              languageLabel
            }}</span></Button
          ></DropdownMenuTrigger
        >
        <DropdownMenuContent align="end"
          ><DropdownMenuRadioGroup v-model="language"
            ><DropdownMenuRadioItem
              v-for="option in languages"
              :key="option.value"
              :value="option.value"
              :lang="option.value"
              >{{ option.label }}</DropdownMenuRadioItem
            ></DropdownMenuRadioGroup
          ></DropdownMenuContent
        >
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger as-child
          ><Button
            variant="ghost"
            size="icon-sm"
            :aria-label="translate('app.theme')"
            ><Sun v-if="theme === 'light'" /><Moon
              v-else-if="theme === 'dark'" /><Monitor v-else /></Button
        ></DropdownMenuTrigger>
        <DropdownMenuContent align="end"
          ><DropdownMenuRadioGroup v-model="theme"
            ><DropdownMenuRadioItem value="light">{{
              translate('app.light')
            }}</DropdownMenuRadioItem
            ><DropdownMenuRadioItem value="dark">{{
              translate('app.dark')
            }}</DropdownMenuRadioItem
            ><DropdownMenuRadioItem value="auto">{{
              translate('app.system')
            }}</DropdownMenuRadioItem></DropdownMenuRadioGroup
          ></DropdownMenuContent
        >
      </DropdownMenu>
    </div>
  </header>
</template>
