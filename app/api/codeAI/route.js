// Тонкая обёртка над единым обработчиком из lib/aiHandlers.js.
// Сохраняет обратную совместимость: клиентский код продолжает
// вызывать /api/codeAI, но логика живёт в handleCode.
export { handleCode as POST } from "@/lib/aiHandlers";
