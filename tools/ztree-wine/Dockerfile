# z-Tree and z-Leaf under Wine, on a virtual display that scripts can see and click.
FROM --platform=linux/amd64 debian:bookworm-slim
RUN dpkg --add-architecture i386 \
 && apt-get update \
 && apt-get install -y --no-install-recommends wine wine32 wine64 xvfb xdotool x11-utils imagemagick procps fonts-dejavu-core \
 && rm -rf /var/lib/apt/lists/*
ENV WINEDEBUG=-all WINEPREFIX=/wine DISPLAY=:1 LANG=C.UTF-8
RUN (Xvfb :1 -screen 0 1280x900x24 &) && sleep 2 && wineboot --init && wineserver -w; true
WORKDIR /work
