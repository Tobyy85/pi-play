import { isDev } from '@main/utils/isDev'
import { EnvConfig } from './types'

const getConfig = <T>(config: EnvConfig<T>): T => {
    return isDev ? config.dev : config.prod
}

const CONFIG = {}

export default CONFIG
