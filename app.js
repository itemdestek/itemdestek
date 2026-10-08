const chat = document.querySelector("#chat");
const box = document.querySelector("#messages");
const input = document.querySelector("#message");

let sessionId = localStorage.getItem("support_session") || crypto.randomUUID();
localStorage.setItem("support_session", sessionId);

function openChat() {
  chat.classList.remove("hidden");
  input.focus();
}

document.querySelector("#open").onclick = openChat;
document.querySelector("#heroOpen").onclick = openChat;
document.querySelector("#close").onclick = () => chat.classList.add("hidden");

function add(t, c) {
  const d = document.createElement("div");
  d.className = "msg " + c;
  d.textContent = t;
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
}

async function send() {
  const t = input.value.trim();
  if (!t) return;

  add(t, "user");
  input.value = "";

  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      add("Demo: backend bağlantısı yapılandırılmamış.", "agent");
      return;
    }

    const response = await fetch(
      SUPABASE_URL + "/rest/v1/support_messages",
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: "Bearer " + SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify({
          session_id: sessionId,
          sender: "user",
          message: t
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Supabase error:", response.status, errorText);
      add("Mesaj gönderilemedi. Supabase bağlantısını kontrol et.", "agent");
      return;
    }

    add("Mesajınız destek ekibine iletildi.", "agent");
  } catch (e) {
    console.error(e);
    add("HATA: " + e.message, "agent");
  }
}

document.querySelector("#send").onclick = send;
input.onkeydown = e => {
  if (e.key === "Enter") send();
};