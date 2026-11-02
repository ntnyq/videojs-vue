/** Composed recipes covering every UI entry added alongside the original 28 controls. */
export const UI_RECIPES = [
  {
    id: 'layout',
    filename: 'LayoutRecipe.vue',
    components: [
      'MediaControlsBackdrop',
      'MediaTitle',
      'TimeGroup',
      'TimeSeparator',
    ],
  },
  {
    id: 'popovers',
    filename: 'PopoverRecipe.vue',
    components: ['MediaPopover', 'VolumePopover'],
  },
  {
    id: 'tooltips',
    filename: 'TooltipRecipe.vue',
    components: ['Tooltip', 'TooltipGroup', 'TooltipLabel', 'TooltipShortcut'],
  },
  {
    id: 'sliders',
    filename: 'SliderRecipe.vue',
    components: [
      'MediaSlider',
      'SliderPreview',
      'SliderValue',
      'SliderThumbnail',
      'Thumbnail',
    ],
  },
  {
    id: 'chapters',
    filename: 'ChapterRecipe.vue',
    components: ['TimeSliderChapters', 'TimeSliderChapterTitle'],
  },
  {
    id: 'menus',
    filename: 'MenuRecipe.vue',
    components: [
      'MediaMenuItem',
      'MediaMenuCheckboxItem',
      'MediaMenuRadioGroup',
      'MediaMenuRadioItem',
      'MediaMenuItemIndicator',
      'MediaMenuGroup',
      'MediaMenuGroupLabel',
      'MediaMenuSeparator',
    ],
  },
  {
    id: 'dialogs',
    filename: 'DialogRecipe.vue',
    components: [
      'MediaDialog',
      'AlertDialog',
      'ErrorDialog',
      'MediaDialogBackdrop',
      'MediaDialogPopup',
      'MediaDialogClose',
      'MediaDialogTitle',
      'MediaDialogDescription',
    ],
  },
  {
    id: 'feedback',
    filename: 'FeedbackRecipe.vue',
    components: [
      'BufferingIndicator',
      'MediaGesture',
      'SeekIndicator',
      'SeekIndicatorValue',
      'StatusIndicator',
      'StatusIndicatorValue',
      'VolumeIndicator',
      'VolumeIndicatorFill',
      'VolumeIndicatorValue',
    ],
  },
  {
    id: 'remote',
    filename: 'RemoteRecipe.vue',
    components: ['AirPlayButton', 'CastButton'],
  },
] as const

export type UiRecipeId = (typeof UI_RECIPES)[number]['id']
export type UiComponentName = (typeof UI_RECIPES)[number]['components'][number]

export const UI_COMPONENTS = UI_RECIPES.flatMap(recipe =>
  recipe.components.map(name => ({ name, recipe: recipe.id })),
)

export function findUiComponents(
  query: string,
  group: UiRecipeId | 'all' = 'all',
) {
  const normalized = query
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]/gu, '')
  return UI_COMPONENTS.filter(
    component =>
      (group === 'all' || component.recipe === group) &&
      `${component.name}${component.recipe}`.toLowerCase().includes(normalized),
  )
}
