export type CallInfo =
    | {
          state: 'incoming' | 'held' | 'dialing' | 'alerting' | 'waiting'
          lineIdentification: string
          startTime: undefined
      }
    | {
          state: 'active'
          lineIdentification: string
          startTime: string
      }
    | {
          state: 'disconnected'
          lineIdentification: undefined
          startTime: undefined
      }
