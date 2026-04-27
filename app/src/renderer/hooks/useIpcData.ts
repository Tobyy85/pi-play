import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react'

type UnsubscribeFunction = () => void
type SubscribeFunction<T> = (callback: (data: T) => void) => UnsubscribeFunction

export interface UseIpcDataReturn<T> {
    data: T | null
    isLoading: boolean
    error: string | null
    refresh: () => Promise<void>
}

const useIpcData = <T>(
    getData: () => Promise<T>,
    subscribe: SubscribeFunction<T>,
    initialValue: T | null = null,
    deps: DependencyList = []
): UseIpcDataReturn<T> => {
    const [data, setData] = useState<T | null>(initialValue)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const getDataRef = useRef(getData)
    const subscribeRef = useRef(subscribe)

    useEffect(() => {
        getDataRef.current = getData
        subscribeRef.current = subscribe
    }, [getData, subscribe])

    const refresh = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const result = await getDataRef.current()
            setData(result)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        void refresh()
    }, [refresh, ...deps]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const unsubscribe = subscribeRef.current(newData => {
            setData(newData)
            setError(null)
        })
        return unsubscribe
    }, deps) // eslint-disable-line react-hooks/exhaustive-deps

    return { data, isLoading, error, refresh }
}

export default useIpcData
