/**
 * Parses a date-time string in the format "YYYYMMDDTHHMMSS" and returns a Date object.
 */
/* eslint-disable @typescript-eslint/no-magic-numbers */
const parseDateTimeString = (dateTimeString: string): Date => {
    const year = parseInt(dateTimeString.slice(0, 4), 10)
    const month = parseInt(dateTimeString.slice(4, 6), 10) - 1
    const day = parseInt(dateTimeString.slice(6, 8), 10)
    const hour = parseInt(dateTimeString.slice(9, 11), 10)
    const minute = parseInt(dateTimeString.slice(11, 13), 10)
    const second = parseInt(dateTimeString.slice(13, 15), 10)

    return new Date(year, month, day, hour, minute, second)
}
/* eslint-enable @typescript-eslint/no-magic-numbers */

/**
 * Formats a date-time string as a relative date (e.g., "Today", "Yesterday", "Monday", or "DD.MM.YYYY").
 */
export const formatRelativeDate = (dateTimeString: string): string => {
    const date = parseDateTimeString(dateTimeString)
    if (isNaN(date.getTime())) {
        return 'Invalid date'
    }
    const now = new Date()

    const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
    if (isToday) {
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: false })
    }

    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    const isYesterday =
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()

    if (isYesterday) {
        return 'Yesterday'
    }

    const oneWeekAgo = new Date(now)
    oneWeekAgo.setDate(now.getDate() - 7) // eslint-disable-line @typescript-eslint/no-magic-numbers
    if (date > oneWeekAgo) {
        return date.toLocaleDateString([], { weekday: 'long' })
    }

    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`
}
