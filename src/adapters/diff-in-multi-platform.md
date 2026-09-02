# deepseek✅️

- adapter
  - prompt undefined 抛出异常

# 元宝✅️

## api

- path: /api/chat/session_id
- host: https://yuanbao.tencent.com
- method：xhr
- payload：prompt
- adapter
  - prompt undefined 抛出异常

## page host

https://yuanbao.tencent.com/

## create or edit

不区分

# qianwen✅️

## api

- path: api/v2/chat
- method: fetch
- host: https://chat2.qianwen.com
- payload structure: messages.find(message.mime-type==='text/plain' && message.content)
- adapter
  - messages 不存在 不是数组 数组长度为空 抛出异常

## page host

https://www.qianwen.com/

## create or edit

不区分

# 文心一言✅️

## api

- path: aichat/api/conversation
- method: fetch
- host:https://chat.baidu.com
- payload structure: message.query.find(item.type==='TEXT' && item.data.text.query)
- adapter
  - message?.query 不存在 不是数组 数组长度为空 抛出异常

## page host

https://wenxin.baidu.com/

## create or edit

不区分

# 智谱清言✅️

## api

- path: /backend-api/assistant/stream
- method: fetch
- host: https://www.chatglm.cn/chatglm
- payload structure: messages[0].content.find(item.type==='text' && item.text)
- adapter
  - messages 不存在 不是数组 数组长度为空 抛出异常

## page host

https://www.chatglm.cn

## create or edit

不区分

# 豆包✅️

## api

- path: /chat/completion
- method: fetch
- host: https://www.doubao.com
- payload structure: messages.find(content_block.some(item.content?.text_block) && item.content_block.content.text_block.text)
- adapter
  - messages 不存在 不是数组 数组长度为空 抛出异常

## page host

https://www.doubao.com

## create or edit

不区分

# kimi✅️

## api

- path: /apiv2/kimi.gateway.chat.v1.ChatService/Chat
- method: fetch
- host: https://www.kimi.com
- payload structure: message.blocks.find(block.text && block.text.content)
  - 使用 Uint8Array，并且开头的 4 个字节非 body 内容
- adapter
  - blocks 不存在 不是数组 数组长度为空 抛出异常

## page host

https://www.kimi.com

## create or edit

不区分

# Gemini❌️

## api

- path: /BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate
- method: xhr
- host: https://gemini.google.com
- payload structure:
  - 使用 formdata

## page host

https://gemini.google.com

## create or edit

# chatgpt❌️

## api

- path: /backend-api/f/conversation
- method: fetch
- host: https://chatgpt.com/
- payload structure: messages[0]?.content?.context_type.includes('text')&&parts.find(typeof item === 'string')

## page host

https://chatgpt.com/

## create or edit

不区分
