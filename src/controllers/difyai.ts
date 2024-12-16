import { Router as Controller } from 'express';
import dotEnv from 'dotenv';

dotEnv.config();

export class DifyAI {
  controller: Controller = Controller();

  body(query: string, conversation_id: string) {
    return {
      inputs: [],
      query,
      response_mode: "streaming",
      conversation_id,
      user: "abc-123"
    }
  }

  constructor() {
    this.controller.get("/dify", this.get.bind(this));
  }

  async get(req, res) {
    try {
      const text = req.query.text;
      const request_conversation_id = req.query.conversation_id ?? "";

      console.log(text, request_conversation_id);
      console.log(this.body(text, request_conversation_id));
      const response = await fetch(`https://api.dify.ai/v1/chat-messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DIFYAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.body(text, request_conversation_id))
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(`Error de API: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let result = '';
      let answer = '';
      let conversation_id = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          result += chunk;

          // Procesar cada línea que comienza con "data: "
          const lines = result.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonString = line.replace('data: ', '');
              try {
                const data = JSON.parse(jsonString);

                if (data.event === "agent_message") {
                  answer += data.answer
                }

                conversation_id = data.conversation_id;
              } catch (e) {
                console.error('Error al parsear JSON:', e);
              }
            }
          }
          result = '';
        }
      }

      console.log(answer, conversation_id);
      res.status(200).json({ answer, conversation_id });
    } catch (err) {
      res.status(500).send(err);
      console.error(err);
    }
  }
}