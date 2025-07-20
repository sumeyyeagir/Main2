import React, { useState, useRef, useEffect } from "react";

const Chatbot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "Merhaba! Size nasıl yardımcı olabilirim?" }
  ]);
  const [chatInput, setChatInput] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    setChatMessages((prev) => [...prev, { sender: "user", text: chatInput }]);
    const messageToSend = chatInput;
    setChatInput("");

    try {
      const response = await fetch("http://localhost:5001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend }),
      });

      if (!response.ok) throw new Error("Chat API çağrısı başarısız.");

      const data = await response.json();

      if (data.error) {
        setChatMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Üzgünüm, cevap alınamadı: " + data.error },
        ]);
      } else {
        setChatMessages((prev) => [...prev, { sender: "bot", text: data.response }]);
      }
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Bir hata oluştu: " + error.message },
      ]);
    }
  };

  return (
    <>
      {/* Chatbot butonu */}
      <button
        style={{
          position: "fixed",
          bottom: "32px",
          right: "32px",
          zIndex: 100,
          background: "#213448",
          color: "white",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          fontSize: "28px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          border: "none",
          cursor: "pointer",
        }}
        onClick={() => setIsChatOpen(true)}
        title="Chatbot"
      >
        🤖
      </button>

      {/* Chatbot modal */}
      {isChatOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 101,
            backdropFilter: "blur(6px)",
            background: "rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
              width: "850px",
              maxWidth: "90vw",
              minHeight: "600px",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            <button
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "transparent",
                border: "none",
                fontSize: "22px",
                cursor: "pointer",
              }}
              onClick={() => setIsChatOpen(false)}
              title="Kapat"
            >
              ✖
            </button>

            {/* Mesajlar alanı */}
            <div
              ref={messagesEndRef}
              style={{
                padding: "24px 16px 8px 16px",
                height: "450px",
                overflowY: "auto",
                marginBottom: "16px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                backgroundColor: "#fafafa",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "18px",
                  fontWeight: "bold",
                  fontSize: "2.2rem",
                  letterSpacing: "1px",
                  color: "#940606ff",
                }}
              >
                Sohbet Asistanı
              </div>

              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                    marginBottom: "10px",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      background: msg.sender === "user" ? "#940606" : "#b84949ff",
                      color: msg.sender === "user" ? "#fff" : "#333",
                      borderRadius:
                        msg.sender === "user"
                          ? "16px 16px 4px 16px"
                          : "16px 16px 16px 4px",
                      padding: "10px 14px",
                      maxWidth: "70%",
                      fontSize: "15px",
                      position: "relative",
                      boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    {msg.text}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "0px",
                        left: msg.sender === "user" ? "auto" : "-8px",
                        right: msg.sender === "user" ? "-8px" : "auto",
                        width: 0,
                        height: 0,
                        
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Giriş alanı */}
            <div
              style={{
                padding: "12px 16px",
                borderTop: "1px solid #eee",
                display: "flex",
                gap: "8px",
              }}
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                placeholder="Sorunuzu yazın..."
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: "15px",
                }}
              />
              <button
                onClick={handleSendMessage}
                style={{
                  background: "rgb(234, 153, 153)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Gönder
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
