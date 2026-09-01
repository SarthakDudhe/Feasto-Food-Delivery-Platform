import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRider } from "../../context/RiderContext";
import "./ChatModal.css";

const ChatModal = ({ order, onClose }) => {
  const { backendUrl, socket } = useRider();
  const [messages, setMessages] = useState(order?.chat || []);
  const [inputText, setInputText] = useState("");
  const [isConnected, setIsConnected] = useState(Boolean(socket?.connected));
  const messagesEndRef = useRef(null);

  // Sync connection state
  useEffect(() => {
    if (!socket) return;
    setIsConnected(socket.connected);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  // Load chat history from server on mount
  useEffect(() => {
    if (!order?._id) return;
    const fetchLatestChat = async () => {
      try {
        const res = await axios.post(`${backendUrl}/api/order/detail`, { orderId: order._id });
        if (res.data?.success && res.data.data?.chat) {
          setMessages(res.data.data.chat);
        }
      } catch (e) {
        // fallback to order.chat passed via props
        if (order.chat) setMessages(order.chat);
      }
    };
    fetchLatestChat();
  }, [backendUrl, order?._id, order?.chat]);

  useEffect(() => {
    if (!socket || !order?._id) return;

    const room = String(order._id);
    console.log(`[Rider Chat] Joining room ${room}`);
    socket.emit("join_order_room", room);

    const handleReceiveMessage = (data) => {
      if (data && String(data.orderId) === room) {
        setMessages((prev) => {
          const isDuplicate = prev.some(
            (m) =>
              m.text === data.text &&
              m.sender === data.sender &&
              Math.abs(new Date(m.timestamp) - new Date(data.timestamp)) < 1500
          );
          if (isDuplicate) return prev;
          return [...prev, data];
        });
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on(`receive_message_${room}`, handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off(`receive_message_${room}`, handleReceiveMessage);
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
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    if (socket && socket.connected) {
      socket.emit("send_message", newMsg);
    } else if (socket) {
      socket.emit("send_message", newMsg);
    }

    try {
      await axios.post(`${backendUrl}/api/order/chat`, newMsg);
    } catch (err) {
      console.error("Error saving chat message:", err);
    }
  };

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <div className="chat-user-info">
            <div className="chat-avatar">
              {order.address?.firstName?.charAt(0) || "C"}
            </div>
            <div>
              <div style={{ fontWeight: "700", fontSize: "15px", display: "flex", alignItems: "center", gap: "6px" }}>
                {order.address?.firstName} {order.address?.lastName}
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "600",
                    padding: "2px 6px",
                    borderRadius: "10px",
                    background: isConnected ? "#dcfce7" : "#fee2e2",
                    color: isConnected ? "#15803d" : "#b91c1c",
                  }}
                >
                  {isConnected ? "● Live" : "○ Offline"}
                </span>
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
            placeholder="Type a message to customer..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="chat-send-btn" disabled={!inputText.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
