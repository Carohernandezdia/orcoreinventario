import { getStore } from "@netlify/blobs";

const KEY = "cardex-cuartofrio";

export default async (req) => {
  const store = getStore("inventario");

  // Traer el cárdex completo
  if (req.method === "GET") {
    const data = await store.get(KEY, { type: "json" });
    return new Response(JSON.stringify(data || {}), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Sumar un conteo (código + cantidad + sección) de forma segura en el servidor
  if (req.method === "POST") {
    const body = await req.json();
    const { codigo, cantidad, seccion, nombre } = body;

    if (!codigo || !cantidad || !seccion) {
      return new Response(JSON.stringify({ error: "Faltan datos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const cardex = (await store.get(KEY, { type: "json" })) || {};

    if (!cardex[codigo]) {
      cardex[codigo] = { nombre: nombre || codigo, Bodega: 0, "Exhibición": 0, Tienda: 0 };
    }
    cardex[codigo][seccion] = (cardex[codigo][seccion] || 0) + Number(cantidad);

    await store.setJSON(KEY, cardex);

    return new Response(JSON.stringify(cardex), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Reiniciar el conteo (usar con cuidado, solo si se necesita empezar de cero)
  if (req.method === "DELETE") {
    await store.setJSON(KEY, {});
    return new Response(JSON.stringify({}), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Método no permitido", { status: 405 });
};

export const config = {
  path: "/api/cardex",
};
