### Frontend build
FROM node:18.14.0-alpine3.17 as frontend

RUN apk update
RUN apk --no-cache add \
    git \
    make \
    gcc \
    g++ \
    musl-dev \
    nodejs \
    npm

RUN yarn add react-scripts

WORKDIR /virtualpaper
COPY . /virtualpaper

RUN cd frontend; yarn install
RUN make build-frontend

# Backend build
FROM golang:1.20-alpine3.17 as backend

RUN apk update
RUN apk --no-cache add \
    git \
    make \
    gcc \
    g++ \
    musl-dev

WORKDIR /virtualpaper
COPY . /virtualpaper
COPY --from=frontend /virtualpaper/frontend/build /virtualpaper/frontend/build

RUN go mod download
RUN make build


# Runtime
FROM alpine:3.17.2

RUN apk add \
    tesseract-ocr \
    imagemagick \
    imagemagick-dev \
    poppler-utils

RUN wget https://github.com/jgm/pandoc/releases/download/2.18/pandoc-2.18-linux-amd64.tar.gz
RUN tar -xvf pandoc-2.18-linux-amd64.tar.gz
RUN rm pandoc-2.18-linux-amd64.tar.gz


RUN addgroup -S -g 1000 virtualpaper && \
    adduser -S -H -D -h /data -u 1000 -G virtualpaper virtualpaper

VOLUME ["/data"]
VOLUME ["/config"]
VOLUME ["/input"]
VOLUME ["/usr/share/tessdata/"]

COPY --from=backend /virtualpaper/virtualpaper /app/virtualpaper
COPY --from=backend /virtualpaper/config.sample.toml /config/config.toml
COPY --from=backend /virtualpaper/docker/imagemagick-7-policy.xml /etc/ImageMagick-7/policy.xml
COPY --from=backend /virtualpaper/docker/start.sh /app/start.sh

ENV VIRTUALPAPER_API_STATIC_CONTENT_PATH="/app/frontend"
ENV VIRTUALPAPER_PROCESSING_DATA_DIR="/data"
ENV VIRTUALPAPER_PROCESSING_INPUT_DIR="/input"
ENV VIRTUALPAPER_LOGGING_DIRECTORY="/log"

ENV VIRTUALPAPER_PROCESSING_PANDOC_BIN="/pandoc-2.18/bin/pandoc"
ENV VIRTUALPAPER_PROCESSING_PDFTOTEXT_BIN="/usr/bin/pdftotext"
ENV VIRTUALPAPER_PROCESSING_IMAGICK_BIN="/usr/bin/convert"
ENV VIRTUALPAPER_PROCESSING_TESSERACT_BIN="/usr/bin/tesseract"

EXPOSE 8000:8000

ENTRYPOINT ["app/start.sh"]
