// Тонкая обёртка над единым обработчиком из lib/aiHandlers.js.
// Сохраняет обратную совместимость: клиентский код продолжает
// вызывать /api/getRecommendations, но логика живёт в handleRecommendations.
export { handleRecommendations as POST } from "@/lib/aiHandlers";
