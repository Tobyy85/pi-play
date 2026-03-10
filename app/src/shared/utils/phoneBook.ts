/* eslint-disable no-magic-numbers */
export const normalizePhoneNumber = (phoneNumber: string): string => {
    const normalized = phoneNumber.replace(/\D/gu, '').slice(-9)
    return normalized
}

export const formatPhoneNumber = (phoneNumber: string): string => {
    const normalized = normalizePhoneNumber(phoneNumber)
    const parts = []
    for (let i = 0; i < normalized.length; i += 3) {
        parts.push(normalized.slice(i, i + 3))
    }
    return parts.join(' ')
}
