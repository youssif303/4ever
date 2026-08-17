import { Router, type IRouter } from "express";
import { SendChatMessageBody, SendChatMessageResponse } from "@workspace/api-zod";
import { getSupportiveResponse } from "../services/ai";

const router: IRouter = Router();

router.post("/chat", async (req, res) => {
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid chat request." });
    return;
  }

  const result = await getSupportiveResponse(parsed.data);
  const data = SendChatMessageResponse.parse(result);
  req.log.info({ conversationId: parsed.data.conversationId, source: data.source }, "Chat response created");
  res.json(data);
});

export default router;