export function isEditorDevModeEnabled(
  value = import.meta.env.VITE_EDITOR_DEV_MODE,
) {
  return value?.trim().toLowerCase() === 'true'
}
