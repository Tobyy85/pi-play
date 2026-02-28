/* eslint-disable no-magic-numbers */
export const normalizePhoneNumber = (phoneNumber: string): string => {
    const normalized = phoneNumber.replace(/\D/gu, '').slice(-9)
    return normalized
}

export const formatPhoneNumber = (phoneNumber: string): string => {
    const normalized = normalizePhoneNumber(phoneNumber)
    if (normalized.length <= 3) return normalized
    if (normalized.length <= 6) {
        return `${normalized.slice(0, 3)} ${normalized.slice(3, 6)}`
    }
    return `${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6, 9)}`
}
