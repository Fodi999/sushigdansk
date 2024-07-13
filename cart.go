package main

import (
    "encoding/json"
    "net/http"
    "sync"
    "strconv"
)

var (
    cartItems []Item
    mutex     sync.Mutex
)

func addItemToCart(w http.ResponseWriter, r *http.Request) {
    var item Item
    err := json.NewDecoder(r.Body).Decode(&item)
    if err != nil {
        http.Error(w, "Invalid item data", http.StatusBadRequest)
        return
    }

    mutex.Lock()
    cartItems = append(cartItems, item)
    mutex.Unlock()

    w.WriteHeader(http.StatusOK)
}

func getCartItems(w http.ResponseWriter, r *http.Request) {
    mutex.Lock()
    defer mutex.Unlock()

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(cartItems)
}

func removeItemFromCart(w http.ResponseWriter, r *http.Request) {
    indexStr := r.URL.Path[len("/api/cart/items/"):]
    index, err := strconv.Atoi(indexStr)
    if err != nil || index < 0 || index >= len(cartItems) {
        http.Error(w, "Invalid item index", http.StatusBadRequest)
        return
    }

    mutex.Lock()
    cartItems = append(cartItems[:index], cartItems[index+1:]...)
    mutex.Unlock()

    w.WriteHeader(http.StatusOK)
}

func clearCart(w http.ResponseWriter, r *http.Request) {
    mutex.Lock()
    cartItems = []Item{}
    mutex.Unlock()

    w.WriteHeader(http.StatusOK)
}


