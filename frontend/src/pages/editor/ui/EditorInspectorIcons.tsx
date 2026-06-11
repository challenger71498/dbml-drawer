type IconProps = {
  className?: string
}

export function DbmlEditorIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
    >
      <path
        d="M4 3.5h12v13H4v-13Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path
        d="M7 7h4M7 10h6M7 13h3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
      <path
        d="M13.5 6.5 15 8l-1.5 1.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  )
}

export function DiagnosticsIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
    >
      <path
        d="M10 2.5 17.5 16h-15L10 2.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path
        d="M10 7.25v4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
      <path
        d="M10 14.5h.01"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
    </svg>
  )
}

export function PresetsIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
    >
      <path
        d="M4 3.5h12v13H4v-13Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path
        d="M7 7h6M7 10h6M7 13h3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  )
}

export function DiagramSettingsIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
    >
      <path
        d="M5.5 4.5h9M5.5 10h9M5.5 15.5h9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
      <circle
        cx="8"
        cy="4.5"
        r="1.8"
        fill="var(--editor-color-panel-bg)"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="12"
        cy="10"
        r="1.8"
        fill="var(--editor-color-panel-bg)"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="9.5"
        cy="15.5"
        r="1.8"
        fill="var(--editor-color-panel-bg)"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
    >
      <path
        d="M10 7.25a2.75 2.75 0 1 1 0 5.5 2.75 2.75 0 0 1 0-5.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="m8.85 2.75-.35 1.6a6 6 0 0 0-1.25.52L5.8 4.02 4.02 5.8l.85 1.45c-.22.4-.4.82-.52 1.25l-1.6.35v2.3l1.6.35c.13.43.3.85.52 1.25l-.85 1.45 1.78 1.78 1.45-.85c.4.22.82.4 1.25.52l.35 1.6h2.3l.35-1.6c.43-.13.85-.3 1.25-.52l1.45.85 1.78-1.78-.85-1.45c.22-.4.4-.82.52-1.25l1.6-.35v-2.3l-1.6-.35a6 6 0 0 0-.52-1.25l.85-1.45-1.78-1.78-1.45.85a6 6 0 0 0-1.25-.52l-.35-1.6h-2.3Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
    >
      <path
        d="M5.5 5.5 14.5 14.5M14.5 5.5 5.5 14.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}
