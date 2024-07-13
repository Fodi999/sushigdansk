//go:generate go build -o main .
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "os"
    "bytes"
    "io"
    "mime/multipart"
    "path/filepath"
    "github.com/joho/godotenv"
)

func sendTelegramMessage(order Order) error {
    telegramToken := os.Getenv("TELEGRAM_TOKEN")
    telegramChannelID := os.Getenv("TELEGRAM_CHANNEL_ID")

    log.Println("Sending photos to Telegram...")
    for _, item := range order.Items {
        caption := item.Title
        photoPath := filepath.Join("public", "images", filepath.Base(item.Image))
        log.Printf("Sending photo path: %s with caption: %s", photoPath, caption)
        err := sendTelegramPhoto(telegramToken, telegramChannelID, photoPath, caption)
        if err != nil {
            log.Println("Error sending photo:", err)
            return err
        }
    }

    // Отправка текстового сообщения с информацией о клиенте и общим заказом
    orderDetails := ""
    for _, item := range order.Items {
        orderDetails += fmt.Sprintf("%s - %s - %s - Количество: %d\n", item.Title, item.Details, item.Price, item.Quantity)
    }
    message := fmt.Sprintf("Новый заказ на суши:\n\nИмя: %s\nАдрес: %s\nТелефон: %s\nДетали заказа:\n%s", order.Name, order.Address, order.Phone, orderDetails)
    textURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", telegramToken)
    textPayload := map[string]string{"chat_id": telegramChannelID, "text": message}
    textPayloadBytes, _ := json.Marshal(textPayload)

    textResp, err := http.Post(textURL, "application/json", bytes.NewBuffer(textPayloadBytes))
    if err != nil {
        log.Println("Error sending text message:", err)
        return err
    }
    defer textResp.Body.Close()
    
    textRespBody, err := io.ReadAll(textResp.Body)
    if err != nil {
        log.Println("Error reading text message response:", err)
        return err
    }
    log.Println("Text message response:", string(textRespBody))

    return nil
}

func sendTelegramPhoto(token, chatID, photoPath, caption string) error {
    url := fmt.Sprintf("https://api.telegram.org/bot%s/sendPhoto", token)

    file, err := os.Open(photoPath)
    if err != nil {
        log.Println("Error opening photo file:", err)
        return err
    }
    defer file.Close()

    var b bytes.Buffer
    w := multipart.NewWriter(&b)
    fw, err := w.CreateFormField("chat_id")
    if err != nil {
        log.Println("Error creating chat_id form field:", err)
        return err
    }
    if _, err = fw.Write([]byte(chatID)); err != nil {
        log.Println("Error writing chat_id:", err)
        return err
    }
    fw, err = w.CreateFormField("caption")
    if err != nil {
        log.Println("Error creating caption form field:", err)
        return err
    }
    if _, err = fw.Write([]byte(caption)); err != nil {
        log.Println("Error writing caption:", err)
        return err
    }
    fw, err = w.CreateFormFile("photo", filepath.Base(photoPath))
    if err != nil {
        log.Println("Error creating form file:", err)
        return err
    }
    if _, err = io.Copy(fw, file); err != nil {
        log.Println("Error copying file:", err)
        return err
    }
    w.Close()

    req, err := http.NewRequest("POST", url, &b)
    if err != nil {
        log.Println("Error creating new request:", err)
        return err
    }
    req.Header.Set("Content-Type", w.FormDataContentType())

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        log.Println("Error sending photo request:", err)
        return err
    }
    defer resp.Body.Close()

    respBody, err := io.ReadAll(resp.Body)
    if err != nil {
        log.Println("Error reading photo response:", err)
        return err
    }
    log.Println("Photo response:", string(respBody))
    return nil
}

func orderHandler(w http.ResponseWriter, r *http.Request) {
    var order Order
    err := json.NewDecoder(r.Body).Decode(&order)
    if err != nil {
        log.Println("Error decoding order data:", err)
        http.Error(w, "Invalid order data", http.StatusBadRequest)
        return
    }

    err = sendTelegramMessage(order)
    if err != nil {
        log.Println("Error sending order to Telegram:", err)
        http.Error(w, "Failed to send order", http.StatusInternalServerError)
        return
    }

    response := map[string]string{"message": "Заказ получен и сообщение отправлено в Telegram"}
    json.NewEncoder(w).Encode(response)
}

func main() {
    err := godotenv.Load()
    if err != nil {
        log.Println("No .env file found")
    }

    http.Handle("/", http.FileServer(http.Dir("./public")))
    http.HandleFunc("/api/cart/add", addItemToCart)
    http.HandleFunc("/api/cart/items", getCartItems)
    http.HandleFunc("/api/cart/items/", removeItemFromCart)
    http.HandleFunc("/api/cart/clear", clearCart)
    http.HandleFunc("/api/order", orderHandler)
    
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    url := fmt.Sprintf("http://localhost:%s", port)
    log.Printf("Server is running at %s", url)
    log.Fatal(http.ListenAndServe(":"+port, nil))
}












