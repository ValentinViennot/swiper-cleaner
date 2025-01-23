FROM thyrlian/android-sdk-vnc:10.0

# Install required APT packages
RUN apt-get update -y && apt-get install -y curl gnupg unzip && \
    apt-get remove -y cmdtest && apt-get -y autoremove && \
    apt-get clean

# Install latest stable NodeJS
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && apt-get clean

# Install latest stable Yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update -y && apt-get install -y yarn && apt-get clean

# Install Android SDK and tools
RUN curl https://dl.google.com/android/repository/commandlinetools-linux-9123335_latest.zip --output /tmp/cmdline.zip && \
    unzip /tmp/cmdline.zip -d /tmp && \
    yes|/tmp/cmdline-tools/bin/sdkmanager --install "cmdline-tools;latest" --sdk_root=/opt/android-sdk/ && \
    rm -rf /tmp/cmdline.zip /tmp/cmdline-tools/
RUN yes|sdkmanager --install \
    "cmdline-tools;latest" \
    "platform-tools" \
    "platforms;android-30"

# Install watchman
RUN apt-get update && apt-get install -y watchman && apt-get clean
