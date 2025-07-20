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

      const data = await response.json();
      if (data.error) {
        setChatMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Üzgünüm, cevap alınamadı: " + data.error },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { sender: "bot", text: data.response },
        ]);
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
      {/* Sabit Chatbot Düğmesi */}
      <button
        onClick={() => setIsChatOpen(true)}
        title="Chatbot"
        style={{
          position: "fixed",
          bottom: "32px",
          right: "32px",
          zIndex: 100,
          background: "#1e293b",
          color: "white",
          borderRadius: "50%",
          width: "74px",
          height: "74px",
          fontSize: "28px",
          border: "none",
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.68)",
          cursor: "pointer",
          transition: "all 0.3s",
        }}
      >
        <img src="/images/assistant.png" alt="PDF" style={{ width: '40px', height: '40px', marginTop:"7px",marginLeft:"6px" }} />
      </button>

      {isChatOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(4px)",
            zIndex: 101,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "800px",
              height: "600px",
              background: "#ffffff",
              borderRadius: "20px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Kapat Butonu */}
            <button
              onClick={() => setIsChatOpen(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "transparent",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                color: "#fff",
              }}
              title="Kapat"
            >
              ✖
            </button>

            {/* Başlık */}
            <div
              style={{
                padding: "20px",
                fontSize: "25px",
                fontWeight: "bold",
                fontFamily: "'Poppins', sans-serif",
                background: "#1e293b",
                color: "#fff",
                textAlign: "center",
              }}
            >
              Sohbet Asistanı
            </div>

            {/* Mesajlar */}
            <div
              ref={messagesEndRef}
              style={{
                flex: 1,
                padding: "16px",
                overflowY: "auto",
                backgroundColor: "#f1f5f9",
              }}
            >
              {chatMessages.map((msg, idx) => (
  <div
    key={idx}
    style={{
      display: "flex",
      flexDirection: msg.sender === "user" ? "row-reverse" : "row",
      alignItems: "flex-start",
      marginBottom: "12px",
    }}
  >
    {/* Avatar */}
    <img
      src={msg.sender === "user" ? "/images/doctor.png" : "/images/assistant.png"}
      alt={msg.sender === "user" ? "User" : "Bot"}
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        objectFit: "cover",
        marginLeft: msg.sender === "user" ? "12px" : "0",
        marginRight: msg.sender === "user" ? "0" : "12px",
      }}
    />

    {/* Mesaj Kutusu */}
    <div
      style={{
        backgroundColor: msg.sender === "user" ? "#94B4C1" : "#a6a6a8ff",
        color: msg.sender === "user" ? "#000000ff" : "#000000ff",
        padding: "10px 14px",
        borderRadius:
          msg.sender === "user"
            ? "18px 18px 0px 18px"
            : "18px 18px 18px 0px",
        maxWidth: "75%",
        fontSize: "15px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      {msg.text}
    </div>
  </div>
))}

            </div>

            {/* Mesaj Giriş Alanı */}
            <div
              style={{
                padding: "12px",
                borderTop: "1px solid #ddd",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#fff",
              }}
            >
              <input
                type="text"
                placeholder="Mesajınızı yazın..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
              <button
                onClick={handleSendMessage}
                style={{
                  padding: "10px 14px",
                  background: "#1e293b",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
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
