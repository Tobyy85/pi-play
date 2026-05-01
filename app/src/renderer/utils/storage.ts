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

export const zustandPersistStorage = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getItem: async (name: string): Promise<any> => {
        return await storage.get(name, null)
    },
    setItem: async (name: string, value: unknown): Promise<void> => {
        await storage.set(name, value)
    },
    removeItem: async (name: string): Promise<void> => {
        await storage.delete(name)
    },
}
