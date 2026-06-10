export function isEditorDevModeEnabled(value?: string) {
  const modeValue =
    arguments.length === 0 ? import.meta.env.VITE_EDITOR_DEV_MODE : value

  return modeValue?.trim().toLowerCase() === 'true'
}
