# How to use with a DevContainer

1. Build and Launch the DevContainer image (VSCode > Reopen in DevContainer)

## Using a real Android device over WiFi

2. From the devcontainer, make sure adb is running in network mode

```sh
adb tcpip 5555
```

3. From your Android device, identify your device's IP address

4. From the devcontainer, connect to the device over WiFi

```sh
adb connect <device-IP>:5555
```

5. From the devcontainer, run the app

```sh
npm run android
```

## Using an emulated device

> TODO

See doc at https://hub.docker.com/r/thyrlian/android-sdk-vnc.
