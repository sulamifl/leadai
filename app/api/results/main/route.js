import mongoose from "mongoose";

/**
 * Next.js API-роут /api/results/main.
 *
 * Заменяет отдельный Express-сервер (app/main/server.js + routes/resultsLoadCount.js).
 * GET  -> возвращает текущее значение счётчика загрузок результатов.
 * POST -> инкрементирует счётчик и возвращает новое значение.
 *
 * Клиентский код обращается по относительному пути, поэтому
 * захардкоженный внешний URL больше не нужен.
 */

// Кэшируем подключение к MongoDB, чтобы не создавать его повторно
// при горячей перезагрузке в dev и при множественных вызовах.
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined. Please set it in .env.local");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Модель счётчика (аналог app/main/models/Counter.js)
const CounterSchema = new mongoose.Schema({
  name: String,
  count: Number,
});

const Counter =
  mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET() {
  try {
    await dbConnect();
    let counter = await Counter.findOne({ name: "resultsLoadCount" });
    if (!counter) {
      counter = new Counter({ name: "resultsLoadCount", count: 0 });
      await counter.save();
    }
    return jsonResponse({ count: counter.count });
  } catch (error) {
    console.error("Error fetching results load count:", error);
    return jsonResponse({ error: "Error: " + error.message }, 400);
  }
}

export async function POST() {
  try {
    await dbConnect();
    const counter = await Counter.findOneAndUpdate(
      { name: "resultsLoadCount" },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );
    return jsonResponse({ count: counter.count });
  } catch (error) {
    console.error("Error updating results load count:", error);
    return jsonResponse({ error: "Error: " + error.message }, 400);
  }
}
