// Тонкая обёртка над единым обработчиком из lib/aiHandlers.js.
// Сохраняет обратную совместимость: клиентский код продолжает
// вызывать /api/voice, но логика живёт в handleVoice.
export { handleVoice as POST } from "@/lib/aiHandlers";
