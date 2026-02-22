// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxtjs/tailwindcss"],

  css: ["~/assets/css/main.css"],

  app: {
    head: {
      title: "Calculadora Solar Perú — ¿Cuántos paneles necesitas?",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Calcula cuántos paneles solares necesitas para tu hogar, empresa o industria en Perú. Datos reales de 24 ciudades peruanas, inventario de equipos y retorno de inversión.",
        },
        {
          name: "keywords",
          content:
            "paneles solares peru, calculadora solar, energia solar trujillo, sistema fotovoltaico",
        },
        { property: "og:title", content: "Calculadora Solar Perú" },
        {
          property: "og:description",
          content: "La calculadora solar más completa del Perú.",
        },
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700;800&display=swap",
        },
      ],
    },
  },

  // Importar datos JSON como assets estáticos accesibles desde /data/
  nitro: {
    publicAssets: [{ dir: "../data", baseURL: "/data" }],
  },
});
