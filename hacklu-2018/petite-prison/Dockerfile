FROM ubuntu

MAINTAINER pspaul

# Set encoding to utf-8, otherwise python breaks
ENV LANG "C.UTF-8"

# Install our dependencies
#   busybox-static: needs to be there for the intended solution
#   gcc, git, make: to build minijail
#   libcap-dev:     dependency of minijail
#   python3:        for the app
#   socat:          will be our server
#   sudo:           to run commands as prison
RUN apt-get update && \
    apt-get install -y \
        busybox-static \
        gcc \
        git \
        libcap-dev \
        make \
        python3 \
        socat \
        sudo \
        && \
    # Checkout and build minijail
    git clone https://android.googlesource.com/platform/external/minijail /tmp/minijail-commit-b7803c810f4602319f4ebb73ee7da67543975466 && \
    cd /tmp/minijail-commit-b7803c810f4602319f4ebb73ee7da67543975466 && \
    git checkout b7803c810f4602319f4ebb73ee7da67543975466 && \
    make LIBDIR=/lib64 && \
    cp libminijail.so libminijailpreload.so /lib64/ && \
    cp minijail0 /usr/bin/ && \
    # Cleanup
    rm -rf /tmp/minijail-commit-b7803c810f4602319f4ebb73ee7da67543975466 && \
    apt purge --auto-remove -y \
        gcc \
        git \
        make \
        && \
    rm -rf /var/lib/apt/lists/* && \
    # Harden the system
    sysctl -w kernel.dmesg_restrict=1 && \
    chmod 700 /var/tmp/ /dev/shm

# Copy the app
COPY . /app/
COPY ./recipes/ /app/recipes/

# Create new users for the app (petite) and the jail (prison)
RUN groupadd -r petite && \
    groupadd -r prison && \
    useradd -r -g petite -G prison petite && \
    useradd -r -g prison prison && \
    # Harden the flag file
    chown prison:root '/app/recipes/gin/Fruity Light-Absorbing Gin' && \
    chmod 500 '/app/recipes/gin/Fruity Light-Absorbing Gin' && \
    # Harden the system further
    chgrp petite /tmp/ && \
    chmod 1775 /tmp/ && \
    # Allow petite to run minijail0 as prison
    echo 'petite ALL=(prison:prison) NOPASSWD:/app/minijail-recipe-executor.sh' >> /etc/sudoers

# Expose the port where socat listens
EXPOSE 1337

# Run as the app user
USER petite
WORKDIR /app/
ENTRYPOINT ["socat", "TCP-LISTEN:1337,reuseaddr,fork", "EXEC:timeout 60 python3 petite_prison.py"]
