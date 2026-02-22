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
            "Calcula cuántos paneles solares necesitas para tu hogar, empresa o industria en Perú. Datos reales de 24 ciudades peruanas.",
        },
        {
          name: "keywords",
          content:
            "paneles solares peru, calculadora solar, energia solar, sistema fotovoltaico",
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
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700;800&display=swap",
        },
      ],
    },
  },

  // Datos JSON como assets estáticos accesibles desde /data/
  nitro: {
    publicAssets: [{ dir: "../data", baseURL: "/data" }],
  },
});
