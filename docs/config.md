# Configuration Paths

### Electron App Configurations

To set Arduino board information.

```
pi-play/
└── app/
    └── src/
        └── main/
            └── config/
```

### App list

To add or modify available applications.

```
pi-play/
└── app/src/renderer/
    └── features/Sidebar/
        └── constants/
            └── appList.ts
```

### Arduino Configuration

To set pin mappings and other configurations.

```
pi-play/
└── hardware/
    └── arduino/
        └── config.h
```
