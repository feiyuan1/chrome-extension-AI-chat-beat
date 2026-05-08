const createIndex = function () {
  return String(Math.floor(Math.random() * 1000));
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "NEW_CHAT_REQUEST") {
    const { body, timestamp, response, platform } = message.payload;
    console.log(
      "AIChatBeat",
      "request body",
      body,
      "request response",
      response,
    );

    const index = createIndex();
    const coreDataItem = {
      session_id: body.chat_session_id,
      timestamp,
      platform,
      index,
    };

    chrome.storage.local.get(["coreChatHistory"], (result) => {
      const coreData = result.coreChatHistory?.data || [];
      console.log("AIChatBeat", "chathistory", result.coreChatHistory);
      coreData.push(coreDataItem);
      // if (history.length > 1000) history.shift();
      chrome.storage.local.set({ coreChatHistory: { data: coreData } });
    });

    chrome.storage.local.get(["fullChatHistory"], (result) => {
      const data = result.fullChatHistory?.data || [];
      console.log("AIChatBeat", "chathistory", data);
      const dataItem = {
        ...coreDataItem,
        prompt: body.prompt || "",
      };
      data.push(dataItem);
      chrome.storage.local.set({ fullChatHistory: { data } });
    });
  }
});
