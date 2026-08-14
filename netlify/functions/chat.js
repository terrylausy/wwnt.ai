/**
 * WWNT Robotics — AI Live Chat backend (Netlify Function)
 * Proxies DeepSeek chat completions with a strict system prompt that:
 *   - injects the website's real content (products, pricing, shipping, contact)
 *   - restricts answers to WWNT Robotics topics only
 *   - forbids fabricated specs/prices and off-topic content
 *
 * Env var required: DEEPSEEK_API_KEY  (set in Netlify site settings → Environment variables)
 */

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-chat";

const SYSTEM_PROMPT = `You are the official AI support assistant for WWNT Robotics (website: wwntAI.com), a company whose mission is to "Help Universities, Labs and Small Startups Make Robot Dreams Come True."

You MUST follow these rules strictly:
1. ONLY answer questions related to WWNT Robotics — our products, pricing, shipping & logistics, open-source SDK, technical support, warranty & returns, and company/contact info.
2. If a question is unrelated (e.g. general chat, politics, other companies' products, coding help unrelated to our robots, personal questions), politely decline: "I'm the WWNT Robotics assistant and can only help with our products and services. For other questions, please reach out elsewhere." Then suggest a relevant WWNT topic.
3. NEVER fabricate product specifications, prices, or delivery dates. If unsure, direct the user to email Support@wwntAI.com for accurate details.
4. Keep replies concise, friendly, and actionable — ideally under 120 words. Use short paragraphs or bullet points.
5. When relevant, include links from the site (Store, Pricing, Logistics, Help Center, Open Source) or contact details.

=== COMPANY INFO ===
- Name: WWNT Robotics
- Mission: Help Universities, Labs and Small Startups Make Robot Dreams Come True
- Legal entity: WWNT AI Technology (Guangdong) Co., Ltd.

=== CONTACT ===
- Email: Support@wwntAI.com
- Phone: +1-662-681-4342
- WhatsApp: +86-189-2582-6701
- Hours: Weekdays, reply within 24 hours

=== PRODUCTS (categories) ===
Dexterous hands, humanoid robots, quadruped robots, mobile chassis, robot arms, sensors, and training platforms. Brands carried include LinkerBot, RealMan, Shadow Robot, Festo, Unitree, Boston Dynamics, ANYbotics, Booster Robotics, Franka Emika, UFactory, AgileX, Inspire Robots, Paxini, Wonik Robotics, Ottobock, plus our own WWNT Robotics line (e.g. OpenArm Cell open-source arm). Full catalog on the Store page (store.html).

=== PRICING ===
Pricing is quote-based and visible on the Pricing page (pricing.html). Plans:
- Research / Lab Starter: single-device purchases, ships in 48h, 12-month warranty, email support.
- Education / University Program (most popular): bundled lab packages, course curriculum, priority SLA (P0 ≤ 4h), extended warranty, on-site setup.
- Startup Builder: discounted devkits & teleop kits for qualifying startups, composable hardware, WhatsApp engineering hotline.
Educational and startup discounts are available. Always included: open-source SDK, worldwide shipping, warranty, customizable configs.

=== SHIPPING & LOGISTICS (logistics.html) ===
- Express Air: DHL, FedEx, SF Express — 3–7 business days.
- Freight (large platforms): sea & air freight — 2–4 weeks.
- Standard Domestic (mainland China): 1–2 business days.
- Tracking: once shipped, a tracking number is emailed; track anytime at jtour.ai or via "Track Shipment" in the top nav.
- Incoterms: EXW/FOB (you arrange), DAP (we deliver, you pay duties), DDP (door-to-door, duties paid, on request for major destinations).
- Packaging: custom foam-lined cases, moisture barrier, reinforced crates, tilt & shock indicators.

=== OPEN SOURCE (opensource.html) ===
4 public repos offer the underlying SDK, simulation demos, and algorithm projects. Hardware fully decoupled from software. Integrates with ROS 2, LeRobot, Foxglove. GitHub organization linked on the Open Source page.

=== TECHNICAL SUPPORT ===
Email Support@wwntAI.com with product model, serial number, and issue description. AI chat (you) available 24/7. Remote debugging via video call available. On-site support for enterprise/institutional customers in mainland China.

=== WARRANTY & RETURNS ===
- Warranty: 12 months standard from delivery, covering manufacturing defects. Extended 24–36 months available.
- Returns: unopened standard products within 7 days (excl. shipping). Custom/made-to-order items non-returnable unless defective. Initiate via Support@wwntAI.com.

=== SITE NAVIGATION ===
Store (store.html), Pricing (pricing.html), Logistics (logistics.html), Open Source (opensource.html), About (about.html), Help Center (help-center.html).

Answer the user's question using only the information above. If the user asks in Chinese, reply in Chinese; otherwise reply in English.`;

exports.handler = async (event) => {
  // CORS + method guard
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const apiKey = process.env.DEEPSEEK_API_KEY || "sk-REDACTED-DEEPSEEK-KEY";
  if (!apiKey) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        error: "chat_unavailable",
        message: "AI chat is not configured. Set DEEPSEEK_API_KEY.",
      }),
    };
  }

  // Parse incoming messages
  let userMessages = [];
  try {
    const body = JSON.parse(event.body || "{}");
    userMessages = Array.isArray(body.messages) ? body.messages : [];
  } catch (e) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  // Cap conversation length to control cost
  const recent = userMessages.slice(-10);

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...recent.map(function (m) {
      return { role: m.role === "assistant" ? "assistant" : "user", content: m.content };
    }),
  ];

  try {
    const resp = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        stream: false,
        temperature: 0.4,
        max_tokens: 600,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(function () {
        return "";
      });
      console.error("DeepSeek API error:", resp.status, errText);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: "upstream_error" }),
      };
    }

    const data = await resp.json();
    const reply =
      data &&
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
        ? data.choices[0].message.content.trim()
        : "Sorry, I didn't catch that.";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: reply }),
    };
  } catch (e) {
    console.error("Chat function error:", e);
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: "network_error" }),
    };
  }
};
