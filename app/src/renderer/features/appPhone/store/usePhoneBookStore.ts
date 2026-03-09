import { create } from 'zustand'

import type { Contact } from '@shared/types/phoneBook'
import { normalizePhoneNumber } from '@shared/utils/phoneBook'

type ContactsByPhone = Record<string, Contact>

interface PhoneBookStore {
    isLoading: boolean
    initialized: boolean
    loadContacts: () => Promise<void>

    contacts: Contact[] | null
    contactsByPhone: ContactsByPhone
}

export const usePhoneBookStore = create<PhoneBookStore>(set => ({
    isLoading: false,
    initialized: false,
    contacts: null,
    contactsByPhone: {},

    loadContacts: async () => {
        set({ isLoading: true })
        try {
            const contacts = await window.api.phoneBook.getContacts()
            const contactsByPhone = contacts.reduce<ContactsByPhone>((index, contact) => {
                index[normalizePhoneNumber(contact.phoneNumber)] = contact
                return index
            }, {})

            set({ contacts, contactsByPhone, initialized: true })
        } catch (err) {
            console.error('Failed to load contacts:', err)
        } finally {
            set({ isLoading: false })
        }
    },
}))
usePhoneBookStore.getState().loadContacts()

export const useContact = (phoneNumber: string): Contact | null => {
    const normalizedNumber = normalizePhoneNumber(phoneNumber)
    return usePhoneBookStore(state => state.contactsByPhone[normalizedNumber] || null)
}

export const useContacts = (): Contact[] | null => {
    return usePhoneBookStore(state => state.contacts)
}
