import Camera from '@renderer/features/appReverseCamera/Camera'
import SidebarLayout from '@renderer/layouts/SidebarLayout'

const AppReverseCamera = () => {
    return (
        <SidebarLayout background={<AppReverseCameraBackground />}>
            <AppReverseCameraContent />
        </SidebarLayout>
    )
}

export default AppReverseCamera

const AppReverseCameraBackground = () => {
    return (
        <div className='size-full bg-black/50'>
            <div className='size-full blur-3xl'>
                <Camera
                    deviceId='1fd215033257ce2031f75ef2193545b2465b8efff9e3f7d50bd69f8cbe5205a2'
                    isMirrored={true}
                />
            </div>
        </div>
    )
}

const AppReverseCameraContent = () => {
    return (
        <div className='size-full overflow-hidden rounded-md'>
            <Camera
                deviceId='1fd215033257ce2031f75ef2193545b2465b8efff9e3f7d50bd69f8cbe5205a2'
                isMirrored={true}
            />
        </div>
    )
}
