#!/bin/bash
echo "Gathering your ip for dev container"

##############################################################################################
# Try to find a valid IP address from available network interfaces
#############################################################################################
ip=""
# Try common interface names
for interface in en0 en1 wlan0 eth0 wlp2s0; do
    if ip=$(ipconfig getifaddr $interface 2>/dev/null) && [ ! -z "$ip" ]; then
        break
    fi
done

# If no IP found, try to get it from route
if [ -z "$ip" ]; then
    ip=$(route get default 2>/dev/null | grep 'interface:' | awk '{print $2}' | xargs ipconfig getifaddr 2>/dev/null)
fi

if [ -z "$ip" ]; then
    echo "Warning: Could not determine IP address"
    ip="localhost"
fi

echo "Using IP: $ip"
echo "REACT_NATIVE_PACKAGER_HOSTNAME=$ip" > $(dirname "$0")/.env
