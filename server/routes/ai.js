import express from "express";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { validate } from "../middleware/validate.js";

const router = express.Router();

const parseExpenseSchema = z.object({
  text: z.string().min(3),
});

const parseBillSchema = z.object({
  text: z.string().min(3),
});

const parseBillImageSchema = z.object({
  imageData: z.string().min(10),
});

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error("GEMINI_API_KEY is not set");
    error.statusCode = 500;
    throw error;
  }

  return new GoogleGenerativeAI(apiKey);
};

const getModel = () => {
  const client = getClient();
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  return client.getGenerativeModel({
    model: modelName,
    generationConfig: { temperature: 0 },
  });
};

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const extractJson = (value) => {
  if (!value) return null;
  const trimmed = value.trim();
  const fenced = trimmed.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  return fenced;
};

const parseAmount = (value) => {
  if (!value) return null;
  const cleaned = value.replace(/,/g, "");
  const parsed = Number.parseInt(cleaned, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseExpenseFallback = (text) => {
  const raw = text || "";
  const lower = raw.toLowerCase();

  const amountMatch = raw.match(/(\d[\d,]*)/);
  const amount = parseAmount(amountMatch ? amountMatch[1] : null);

  let description = null;
  const forIndex = lower.indexOf(" for ");
  if (forIndex !== -1) {
    const afterFor = raw.slice(forIndex + 5);
    const withIndex = afterFor.toLowerCase().indexOf(" with ");
    description = (withIndex !== -1 ? afterFor.slice(0, withIndex) : afterFor).trim();
  }

  let payer = null;
  const paidByMatch = raw.match(/paid by\s+([A-Za-z]+(?:\s+[A-Za-z]+)*)/i);
  const startPaidMatch = raw.match(/^([A-Za-z]+(?:\s+[A-Za-z]+)*)\s+paid\b/i);
  if (paidByMatch) {
    payer = paidByMatch[1].trim();
  } else if (startPaidMatch) {
    payer = startPaidMatch[1].trim();
  } else if (lower.includes("i paid")) {
    payer = null;
  }

  const members = [];
  const withMatch = raw.match(/\bwith\s+([^\.]+)/i);
  if (withMatch) {
    const names = withMatch[1]
      .split(/,| and /i)
      .map((name) => name.trim())
      .filter(Boolean);
    members.push(...names);
  }

  return {
    payer,
    amount,
    description: description || null,
    members,
  };
};

const parseBillFallback = (text) => {
  const lines = (text || "").split(/\r?\n/).map((line) => line.trim());
  const items = [];
  let totalAmount = null;

  lines.forEach((line) => {
    if (!line) return;
    const totalMatch = line.match(/\btotal\b\s*[:\-]?\s*(\d[\d,]*)/i);
    if (totalMatch) {
      totalAmount = parseAmount(totalMatch[1]);
      return;
    }

    const itemMatch = line.match(/^(.+?)\s+(\d[\d,]*)$/);
    if (itemMatch) {
      items.push({
        name: itemMatch[1].trim(),
        amount: parseAmount(itemMatch[2]) || 0,
      });
    }
  });

  return { items, totalAmount };
};

router.post(
  "/parse-expense",
  validate(parseExpenseSchema),
  async (req, res, next) => {
    try {
      const model = getModel();
      const prompt = [
        "Extract expense details from the text.",
        "Return JSON with: payer, amount, description, members.",
        "payer: string name, amount: integer, description: string, members: array of string names.",
        "If a field is missing, set it to null.",
      ].join(" ");

      const response = await model.generateContent(
        `${prompt}\nText: ${req.body.text}`
      );
      const content = response.response.text();
      const parsed = safeJsonParse(extractJson(content));
      if (!parsed) {
        return res.json(parseExpenseFallback(req.body.text));
      }

      res.json(parsed);
    } catch (error) {
      res.json(parseExpenseFallback(req.body.text));
    }
  }
);

router.get("/models", async (req, res, next) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "GEMINI_API_KEY is not set" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const payload = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(payload);
    }

    const models = payload.models || [];
    res.json(
      models.map((model) => ({
        name: model.name,
        supportedMethods: model.supportedMethods || [],
      }))
    );
  } catch (error) {
    next(error);
  }
});

router.post("/parse-bill", validate(parseBillSchema), async (req, res, next) => {
  try {
    const model = getModel();
    const prompt = [
      "Extract bill items and total from the text.",
      "Return JSON with: items, totalAmount.",
      "items: array of { name, amount } where amount is integer.",
      "totalAmount: integer or null.",
    ].join(" ");

    const response = await model.generateContent(
      `${prompt}\nText: ${req.body.text}`
    );

    const content = response.response.text();
    const parsed = safeJsonParse(extractJson(content));
    if (!parsed) {
      return res.json(parseBillFallback(req.body.text));
    }

    res.json(parsed);
  } catch (error) {
    res.json(parseBillFallback(req.body.text));
  }
});

router.post(
  "/parse-bill-image",
  validate(parseBillImageSchema),
  async (req, res, next) => {
    try {
      const apiKey = process.env.OCR_SPACE_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "OCR_SPACE_API_KEY is not set" });
      }

      const body = new URLSearchParams({
        apikey: apiKey,
        base64Image: req.body.imageData,
        language: "eng",
        isOverlayRequired: "false",
      });

      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      const payload = await response.json();
      if (!response.ok || payload.IsErroredOnProcessing) {
        return res.status(422).json({
          message: payload.ErrorMessage?.[0] || "OCR failed",
        });
      }

      const text = payload.ParsedResults?.[0]?.ParsedText || "";
      if (!text.trim()) {
        return res.status(422).json({ message: "No text detected" });
      }

      res.json(parseBillFallback(text));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
