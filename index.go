package main

import (
	"encoding/base64"
	"io"
	"log"
	"net/http"
	"os"
	"time"
)

const BUFFER_SIZE = 64 * 1024 // 64KB

func safeHandler(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if rec := recover(); rec != nil {
				log.Printf("Recovered from panic: %v", rec)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			}
		}()
		fn(w, r)
	}
}

func proxyHandler(w http.ResponseWriter, r *http.Request) {
	data := r.URL.Query().Get("data")
	if data == "" {
		http.Error(w, "Not Found", http.StatusBadRequest)
		return
	}

	decodedURL, err := base64.StdEncoding.DecodeString(data)
	if err != nil {
		http.Error(w, "Not Found", http.StatusBadRequest)
		return
	}

	// Cấu hình Transport cho client để tái sử dụng kết nối.
	transport := &http.Transport{
		MaxIdleConns:    100,
		IdleConnTimeout: 90 * time.Second,
		// DisableCompression: false (mặc định) để hỗ trợ nén
	}

	client := &http.Client{
		Timeout:   10 * time.Second,
		Transport: transport,
	}

	req, err := http.NewRequest("GET", string(decodedURL), nil)
	if err != nil {
		http.Error(w, "Failed to create request", http.StatusInternalServerError)
		return
	}

	// Thiết lập các header giống như trong phiên bản Node.js
	req.Header.Set("Accept", "*/*")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 6.2; Win64; x64; en-US) Gecko/20130401 Firefox/53.5")
	req.Header.Set("Referer", "nettruyenviet.com")

	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		http.Error(w, "Image not found", http.StatusNotFound)
		return
	}
	defer resp.Body.Close()

	// Thiết lập header cho response của proxy
	w.Header().Set("Content-Type", resp.Header.Get("Content-Type"))
	w.Header().Set("Transfer-Encoding", "chunked")

	buffer := make([]byte, BUFFER_SIZE)
	for {
		n, err := resp.Body.Read(buffer)
		if n > 0 {
			if _, writeErr := w.Write(buffer[:n]); writeErr != nil {
				log.Printf("Error writing to response: %v", writeErr)
				return
			}
			// Kiểm tra an toàn trước khi flush
			if flusher, ok := w.(http.Flusher); ok {
				flusher.Flush()
			}
		}
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Printf("Error reading image: %v", err)
			return
		}
	}
}
func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	http.HandleFunc("/", safeHandler(proxyHandler))

	log.Printf("Server is running at http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
