import { isDev } from '@main/utils/isDev'
import { EnvConfig } from './types'

import { ARDUINO_CONFIG } from './modules/arduino'

const getConfig = <T>(config: EnvConfig<T>): T => {
    return isDev ? config.dev : config.prod
}

const CONFIG = {
    arduino: getConfig(ARDUINO_CONFIG),
}

export default CONFIG
