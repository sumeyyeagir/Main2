import React, { useState, useRef, useEffect } from "react";

const Chatbot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const initialMessages = JSON.parse(localStorage.getItem("chatbotMessages")) || [
    { sender: "bot", text: "Merhaba! Size nasıl yardımcı olabilirim?", time: Date.now() },
  ];
  const [chatMessages, setChatMessages] = useState(initialMessages);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("chatbotMessages", JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  const formatTime = (time) => {
    const d = new Date(time);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      sender: "user",
      text: chatInput,
      time: Date.now(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    const messageToSend = chatInput;
    setChatInput("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:5001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend }),
      });

      const data = await response.json();
      const botText = data.error
        ? "Üzgünüm, cevap alınamadı: " + data.error
        : data.response;

      const botMessage = {
        sender: "bot",
        text: botText,
        time: Date.now(),
      };

      setTimeout(() => {
        setChatMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 1200);
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Bir hata oluştu: " + error.message,
          time: Date.now(),
        },
      ]);
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Sabit Chatbot Butonu */}
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
        <img
          src="/images/assistant.png"
          alt="Asistan"
          style={{ width: "40px", height: "40px", marginTop: "7px", marginLeft: "6px" }}
        />
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
              background: theme === "light" ? "#ffffff" : "#2f2f2f", // koyu gri arka plan dark modda
              color: theme === "light" ? "#000" : "#f0e6d2", // açık krem yazı rengi dark modda
              borderRadius: "20px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Üst Bar */}
            <div
              style={{
                padding: "20px",
                fontSize: "25px",
                fontWeight: "bold",
                fontFamily: "'Poppins', sans-serif",
                background: "#1e293b",
                color: "#fff",
                textAlign: "center",
                position: "relative",
              }}
            >
              Sohbet Asistanı

              {/* Kapat Butonu */}
              <button
                onClick={() => setIsChatOpen(false)}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
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

              {/* Tema Değiştir */}
              <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "12px",
                  background: theme === "light" ? "#4caf50" : "#5a4a2e", // koyu modda kahverengimsi buton
                  color: "white",
                  padding: "6px 12px",
                  fontSize: "14px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                }}
                title="Tema Değiştir"
              >
                {theme === "light" ? "Karanlık Mod" : "Açık Mod"}
              </button>
            </div>

            {/* Mesajlar */}
            <div
              ref={messagesEndRef}
              style={{
                flex: 1,
                padding: "16px",
                overflowY: "auto",
                backgroundColor: theme === "light" ? "#f1f5f9" : "#2c3e50", // bot mesajları lacivert tonu arka planı
                color: theme === "light" ? "#000" : "#f0e6d2",
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
                  <img
                    src={msg.sender === "user" ? "/images/doctor.png" : "/images/assistant.png"}
                    alt={msg.sender}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginLeft: msg.sender === "user" ? "12px" : "0",
                      marginRight: msg.sender === "user" ? "0" : "12px",
                    }}
                  />

                  <div
                    style={{
                      backgroundColor: msg.sender === "user"
                        ? (theme === "light" ? "#94B4C1" : "#8b6f5c") // kullanıcı balonu toprak tonları
                        : (theme === "light" ? "#a6a6a8ff" : "#34495e"), // bot balonu lacivert tonları
                      color: theme === "light" ? "#000" : "#f0e6d2", // açık krem yazı
                      padding: "10px 14px",
                      borderRadius: msg.sender === "user"
                        ? "18px 18px 0px 18px"
                        : "18px 18px 18px 0px",
                      maxWidth: "75%",
                      fontSize: "15px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                  >
                    {msg.text}
                    <div style={{ fontSize: "11px", textAlign: "right", marginTop: "4px", opacity: 0.6 }}>
                      {formatTime(msg.time)}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div style={{ fontStyle: "italic", paddingLeft: "16px", fontSize: "14px", color: "#888" }}>
                  Asistan yazıyor...
                </div>
              )}
            </div>

            {/* Giriş Alanı */}
            <div
              style={{
                padding: "12px",
                borderTop: "1px solid #ddd",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: theme === "light" ? "#fff" : "#3e2c23", // kahverengimsi koyu zemin
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
                  backgroundColor: "inherit",
                  color: "inherit",
                }}
              />
              <button
                onClick={handleSendMessage}
                style={{
                  padding: "10px 14px",
                  background: theme === "light" ? "#1e293b" : "#5a4a2e", // kahverengimsi buton koyu modda
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "bold",
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
