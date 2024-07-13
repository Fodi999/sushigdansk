//tupes.go file contains the struct definitions for the Item and Order types. The Item type represents a single item in the store, while the Order type represents an order placed by a customer. The JSON tags are used to specify the field names when marshaling and unmarshaling JSON data.
package main

type Item struct {
    Title    string `json:"title"`
    Details  string `json:"details"`
    Price    string `json:"price"`
    Image    string `json:"image"`
    Quantity int    `json:"quantity"`
}

type Order struct {
    Name    string `json:"name"`
    Address string `json:"address"`
    Phone   string `json:"phone"`
    Items   []Item `json:"items"`
}



