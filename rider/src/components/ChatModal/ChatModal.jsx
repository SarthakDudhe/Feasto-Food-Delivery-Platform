import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRider } from "../../context/RiderContext";
import "./ChatModal.css";

const ChatModal = ({ order, onClose }) => {
  const { backendUrl, socket, rider } = useRider();
  const [messages, setMessages] = useState(order?.chat || []);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket || !order?._id) return;

    socket.emit("join_order_room", order._id);

    const handleReceiveMessage = (data) => {
      if (data.orderId === order._id) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, order?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      orderId: order._id,
      sender: "Rider",
      text: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    if (socket) {
      socket.emit("send_message", newMsg);
    }

    try {
      await axios.post(`${backendUrl}/api/order/chat`, newMsg);
    } catch (err) {
      console.error("Error saving chat message:", err);
    }
  };

  return (
    <div className="chat-modal-overlay">
      <div className="chat-modal-container">
        <div className="chat-header">
          <div className="chat-user-info">
            <div className="chat-avatar">
              {order.address?.firstName?.charAt(0) || "C"}
            </div>
            <div>
              <div style={{ fontWeight: "700", fontSize: "15px" }}>
                {order.address?.firstName} {order.address?.lastName}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Customer • Order #{order._id?.slice(-5)}
              </div>
            </div>
          </div>
          <button className="chat-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="chat-messages-area">
          {messages.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-muted)", margin: "auto" }}>
              Send a quick message to coordinate delivery arrival.
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`chat-bubble ${m.sender === "Rider" ? "rider" : "customer"}`}
              >
                {m.text}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-bar">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="chat-send-btn">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
