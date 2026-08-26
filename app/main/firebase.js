// Единая точка инициализации Firebase — см. lib/firebase.js
// Этот файл оставлен для обратной совместимости и реэкспортирует
// Realtime Database из единого модуля.
import { rtdb as db } from "@/lib/firebase";

export { db };
