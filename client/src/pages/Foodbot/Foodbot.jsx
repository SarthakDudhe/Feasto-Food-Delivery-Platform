import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function Foodbot() {
  const [open, setOpen] = useState(false);
  const url = "https://feasto-backend-e0ic.onrender.com";
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi 👋 I’m Feasto AI. What are you craving today?" }
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  // Auto scroll to bottom when new message appears
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send request to backend and fetch recipe
  const fetchRecipe = async (userQuery) => {
    // Add loading placeholder
    setMessages(m => [...m, { role: "bot", text: "Fetching your recipe... 🍳" }]);

    try {
      const { data } = await axios.post(`${url}/api/ai/chat-recommend`, { inp_text: userQuery });

      if (!data.success) {
        setMessages(m => [
          ...m.slice(0, -1), // remove placeholder
          { role: "bot", text: "Sorry, I couldn't fetch recipes. 😅" }
        ]);
        return;
      }

      const recipeText = data.data; // AI returns cleaned text with \n
      setMessages(m => [
        ...m.slice(0, -1), // remove placeholder
        { role: "bot", text: recipeText }
      ]);

    } catch (error) {
      console.error(error);
      setMessages(m => [
        ...m.slice(0, -1),
        { role: "bot", text: "Something went wrong while fetching recipes. ❌" }
      ]);
    }
  };

  // Handle user input
  const send = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    await fetchRecipe(userMsg);
  };

  return (
    <>
      {/* Floating circular button */}
      {!open && (
        <button className="floating-chat-btn" onClick={() => setOpen(true)}>
          🍴
        </button>
      )}

      {/* Chat card */}
      {open && (
        <div className="feasto-chat-overlay">
          <div className="chat-card">
            <header className="chat-header">
              <div>
                <h3>Feasto AI</h3>
                <p>Smart food assistant</p>
              </div>
              <button onClick={() => setOpen(false)}>✕</button>
            </header>

            {/* Chat messages */}
            <div className="chat-body">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`bubble ${m.role}`}
                  style={m.role === "bot" ? { whiteSpace: "pre-line" } : {}}
                >
                  {m.text}
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="chat-input">
              <input
                placeholder="Ask for food recommendations…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send()}
              />
              <button onClick={send}>➤</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .floating-chat-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #ff4d4f;
          color: white;
          font-size: 28px;
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          transition: transform 0.2s;
        }
        .floating-chat-btn:hover { transform: scale(1.1); }

        .feasto-chat-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.2);
          display: flex;
          justify-content: flex-end;
          align-items: flex-end;
          padding: 16px;
          z-index: 1000;
        }

        .chat-card {
          width: 360px;
          height: 520px;
          background: white;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px;
          border-bottom: 1px solid #eee;
        }
        .chat-header h3 { margin: 0; color: #ff4d4f; }
        .chat-header button { border: none; background: none; font-size: 18px; cursor: pointer; }

        .chat-body {
          flex: 1;
          padding: 14px;
          overflow-y: auto;
          background: #fafafa;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .bubble {
          max-width: 80%;
          padding: 10px 12px;
          border-radius: 14px;
          font-size: 14px;
        }
        .bubble.bot { background: #fff; border: 1px solid #eee; }
        .bubble.user { align-self: flex-end; background: #ff4d4f; color: white; }

        .chat-input {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid #eee;
        }
        .chat-input input {
          flex: 1;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #ddd;
        }
        .chat-input button {
          background: #ff4d4f;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 0 14px;
        }

        @media (max-width: 600px) {
          .chat-card { width: 100%; height: 100%; border-radius: 0; }
        }
      `}</style>
    </>
  );
}
