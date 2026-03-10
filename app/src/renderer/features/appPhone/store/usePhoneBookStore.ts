import { create } from 'zustand'

import type { Contact } from '@shared/types/phoneBook'
import { normalizePhoneNumber } from '@shared/utils/phoneBook'

type ContactsByPhone = Record<string, Contact>

interface PhoneBookStore {
    isLoading: boolean
    initialized: boolean
    initialize: () => Promise<void>
    refreshContacts: () => Promise<void>

    contacts: Contact[] | null
    contactsByPhone: ContactsByPhone
}

let contactsUnsubscribe: (() => void) | null = null
let initializePromise: Promise<void> | null = null

export const usePhoneBookStore = create<PhoneBookStore>((set, get) => ({
    isLoading: false,
    initialized: false,
    contacts: null,
    contactsByPhone: {},

    refreshContacts: async () => {
        set({ isLoading: true })
        try {
            const contacts = await window.api.phoneBook.contacts.get()
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

    initialize: async () => {
        if (get().initialized) return
        if (initializePromise) {
            await initializePromise
            return
        }

        initializePromise = (async () => {
            await get().refreshContacts()

            if (!contactsUnsubscribe) {
                contactsUnsubscribe = window.api.phoneBook.contacts.subscribe(contacts => {
                    set({ contacts })
                })
            }

            set({ initialized: true })
        })()

        try {
            await initializePromise
        } finally {
            initializePromise = null
        }
    },
}))
void usePhoneBookStore.getState().initialize() // eslint-disable-line no-void

export const useContact = (phoneNumber: string): Contact | null => {
    const normalizedNumber = normalizePhoneNumber(phoneNumber)
    return usePhoneBookStore(state => state.contactsByPhone[normalizedNumber] || null)
}

export const useContacts = (): Contact[] | null => {
    return usePhoneBookStore(state => state.contacts)
}
