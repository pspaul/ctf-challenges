FROM ubuntu:18.04

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /selenium
RUN apt-get update \
    && apt-get install -y \
        wget \
        python3 \
        python3-pip \
        software-properties-common \
    # prepare installation of Firefox Beta (to not suffer from the following CSP bypass: https://twitter.com/abrasaxor/status/1182828876877238273)
    && add-apt-repository ppa:mozillateam/firefox-next \
    && apt-get update \
    && apt-get install -y \
        firefox \
    # install selenium + driver
    && pip3 install selenium \
    && wget https://github.com/mozilla/geckodriver/releases/download/v0.25.0/geckodriver-v0.25.0-linux64.tar.gz \
    && tar -xvzf geckodriver* \
    && chmod +x geckodriver \
    && mv geckodriver /usr/bin/

COPY bot.py save-our-planet.xpi /selenium/

ENV TIMEOUT_SECS=10

ENTRYPOINT [ "python3", "bot.py" ]
