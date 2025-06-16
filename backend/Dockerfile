# Build stage
FROM golang:1.24-alpine AS builder

# Install dependencies
RUN apk add --no-cache git

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Get build args
ARG GIT_COMMIT=unknown
ARG BUILD_TIME=unknown
ARG VERSION=1.0.0

# Build the application with version info
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo \
    -ldflags "-X 'github.com/toof-jp/shisha-log/backend/internal/version.GitCommit=${GIT_COMMIT}' \
    -X 'github.com/toof-jp/shisha-log/backend/internal/version.BuildTime=${BUILD_TIME}' \
    -X 'github.com/toof-jp/shisha-log/backend/internal/version.Version=${VERSION}'" \
    -o server ./cmd/server

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS and tzdata for timezone support
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/server .

# Expose port
EXPOSE 8080

# Run the binary
CMD ["./server"]