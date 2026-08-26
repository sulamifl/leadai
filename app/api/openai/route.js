// Тонкая обёртка над единым обработчиком из lib/aiHandlers.js.
// Сохраняет обратную совместимость: клиентский код продолжает
// вызывать /api/openai, но логика живёт в handleEssay.
export { handleEssay as POST } from "@/lib/aiHandlers";
