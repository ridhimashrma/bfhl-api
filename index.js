
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const EMAIL = "ridhima2430.be23@chitkara.edu.in";

app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL
  });
});

function fibonacci(n) {
  let arr = [0, 1];
  for (let i = 2; i < n; i++) {
    arr.push(arr[i - 1] + arr[i - 2]);
  }
  return arr.slice(0, n);
}

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

function hcf(a, b) {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

function lcm(a, b) {
  return (a * b) / hcf(a, b);
}

async function askAI(value) {
  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [
          {
            parts: [
              {
                text: `Answer the following question in EXACTLY ONE WORD only. No explanation.\nQuestion: ${value}`
              }
            ]
          }
        ]
      },
      {
        params: { key: process.env.GEMINI_API_KEY },
        headers: { "Content-Type": "application/json" },
        timeout: 10000
      }
    );

    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw "Empty AI response";
    }

    return text.trim().split(/\s+/)[0];
  } catch {
    throw "AI calculation failed";
  }
}

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const keys = Object.keys(body);

    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        official_email: EMAIL,
        data: "Exactly one key is required"
      });
    }

    const key = keys[0];
    const value = body[key];
    let result;

    switch (key) {
      case "fibonacci":
        if (!Number.isInteger(value) || value <= 0) {
          throw "Invalid fibonacci input";
        }
        result = fibonacci(value);
        break;

      case "prime":
        if (!Array.isArray(value)) {
          throw "Invalid prime input";
        }
        result = value.filter(isPrime);
        break;

      case "lcm":
        if (!Array.isArray(value) || value.length === 0) {
          throw "Invalid lcm input";
        }
        result = value.reduce((a, b) => lcm(a, b));
        break;

      case "hcf":
        if (!Array.isArray(value) || value.length === 0) {
          throw "Invalid hcf input";
        }
        result = value.reduce((a, b) => hcf(a, b));
        break;

      case "AI":
        if (typeof value !== "string" || value.trim().length === 0) {
          throw "Invalid AI input";
        }
        result = await askAI(value);
        break;

      default:
        throw "Invalid key";
    }

    res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      is_success: false,
      official_email: EMAIL,
      data: error.toString()
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
