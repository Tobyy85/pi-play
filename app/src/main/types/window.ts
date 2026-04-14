import type { BrowserWindow } from 'electron'

export type WindowProvider = () => BrowserWindow | null
