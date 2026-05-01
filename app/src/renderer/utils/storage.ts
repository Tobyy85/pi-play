export const storage = {
    get: async <T>(key: string, defaultValue?: unknown): Promise<T> => {
        return await window.api.storage.get(key, defaultValue)
    },
    set: async (key: string, value: unknown): Promise<void> => {
        await window.api.storage.set(key, value)
    },
    delete: async (key: string): Promise<void> => {
        await window.api.storage.delete(key)
    },
}
