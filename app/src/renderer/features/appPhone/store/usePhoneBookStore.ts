import { create } from 'zustand'

import type { Contact } from '@shared/types/phoneBook'
import { normalizePhoneNumber } from '@shared/utils/phoneBook'

interface PhoneBookStore {
    isLoading: boolean
    initialized: boolean
    loadContacts: () => Promise<void>

    contacts: Contact[] | null
}

export const usePhoneBookStore = create<PhoneBookStore>(set => ({
    isLoading: false,
    initialized: false,
    contacts: null,

    loadContacts: async () => {
        set({ isLoading: true })
        try {
            const contacts = await window.api.phoneBook.getContacts()
            set({ contacts, initialized: true })
        } catch (err) {
            console.error('Failed to load contacts:', err)
        } finally {
            set({ isLoading: false })
        }
    },
}))
usePhoneBookStore.getState().loadContacts()

export const useContact = (phoneNumber: string): Contact | null => {
    const contacts = usePhoneBookStore(state => state.contacts)
    if (!contacts) return null

    const normalizedNumber = normalizePhoneNumber(phoneNumber)
    //! Don't need to normalize the contact's phone number here
    //! since it's already normalized when we load it in PhoneBookService
    return contacts.find(contact => contact.phoneNumber === normalizedNumber) || null
}

export const useContacts = (): Contact[] | null => {
    return usePhoneBookStore(state => state.contacts)
}
