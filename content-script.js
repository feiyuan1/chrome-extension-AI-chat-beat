function injectScript() {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("./injected.js");
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
}

injectScript();

// 监听来自 injected 的消息，转发给 background
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data?.type === "AI_CHAT_REQUEST") {
    chrome.runtime.sendMessage({
      type: "NEW_CHAT_REQUEST",
      payload: event.data.payload,
    });
  }
});
