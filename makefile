build:
    go build -o main .

start: build
    ./main
