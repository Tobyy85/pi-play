import { controlIds } from '@shared/config/hardwareControls'

import type { HardwareControlActions } from '@main/utils/hardwareControlActions'
import type { ArduinoData } from '@shared/types/arduino'
import type { ControlId } from '@shared/types/hardwareControls'

type SensorHandler = (value: ArduinoData['value']) => Promise<void>

class HardwareControlsService {
    private readonly actions: HardwareControlActions
    private readonly sensorHandlers: Map<ControlId, SensorHandler> = new Map()

    constructor(actions: HardwareControlActions) {
        this.actions = actions
        this.registerSensorHandlers()
    }

    public handleArduinoData(data: ArduinoData): void {
        const handler = this.sensorHandlers.get(data.sensorId as ControlId) // eslint-disable-line @typescript-eslint/no-unsafe-type-assertion
        if (handler) {
            handler(data.value).catch((error: unknown) => {
                console.error(
                    `[HardwareControlsService]: Error handling sensor data for ${data.sensorId}: `,
                    error
                )
            })
        }
        // Only warn if it's a known controlId, otherwise it might be some other sensor data that we don't care about
        else if (HardwareControlsService.isControlId(data.sensorId)) {
            console.warn(`[HardwareControlsService]: No handler registered for sensorId ${data.sensorId}`)
        }
    }

    public disconnect(): void {
        this.sensorHandlers.clear()
    }

    private registerSensorHandlers(): void {
        this.sensorHandlers.set('volumeEncoder', async value => {
            if (typeof value !== 'number') {
                return
            }

            if (value === 0) {
                await this.actions.onMuteToggle()
            } else {
                await this.actions.onVolumeChange(value)
            }
        })

        this.registerButtonHandler('playPause', async () => {
            await this.actions.onPlayPause()
        })

        this.registerButtonHandler('previousTrack', async () => {
            await this.actions.onPreviousTrack()
        })

        this.registerButtonHandler('nextTrack', async () => {
            await this.actions.onNextTrack()
        })

        this.registerButtonHandler('answerCall', async () => {
            await this.actions.onAnswerCall()
        })

        this.registerButtonHandler('hangup', async () => {
            await this.actions.onHangup()
        })
    }

    private registerButtonHandler(controlId: ControlId, action: () => Promise<void>): void {
        this.sensorHandlers.set(controlId, async value => {
            // Must be === true, because value can be number
            if (value === true) {
                await action()
            }
        })
    }

    private static isControlId(sensorId: string): sensorId is ControlId {
        return controlIds.some(controlId => controlId === sensorId)
    }
}

export default HardwareControlsService
