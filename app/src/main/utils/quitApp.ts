import { runCommand } from '@main/utils/runCommand'
import { app, ipcMain } from 'electron'

export const registerQuitAppHandler = (): void => {
    ipcMain.handle('quit-app', async () => {
        app.quit()
        await runCommand('systemctl', ['--user', 'stop', 'pi-play.service'])
    })
}
