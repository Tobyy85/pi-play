import { ipcMain } from 'electron'

import * as storage from 'electron-json-storage'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class StorageService {
    public static registerIpcHandlers(): void {
        ipcMain.handle('storage:get', async (event, key: string, defaultValue?: unknown) => {
            return await StorageService.get(key, defaultValue)
        })

        ipcMain.handle('storage:set', (event, key: string, value: unknown) => {
            StorageService.set(key, value)
        })

        ipcMain.handle('storage:delete', (event, key: string) => {
            StorageService.delete(key)
        })
    }

    public static async get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
        return await new Promise(resolve => {
            storage.get(key, (error, data) => {
                if (error) {
                    console.error(`Error getting key "${key}" from storage:`, error)
                    resolve(defaultValue)
                    return
                }
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                resolve((data as T) || defaultValue)
            })
        })
    }

    public static set(key: string, value: unknown): void {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        storage.set(key, JSON.parse(JSON.stringify(value)), error => {
            if (error) {
                console.error(`Error setting key "${key}" in storage:`, error)
            }
        })
    }

    public static delete(key: string): void {
        storage.remove(key, error => {
            if (error) {
                console.error(`Error deleting key "${key}" from storage:`, error)
            }
        })
    }
}

export default StorageService
