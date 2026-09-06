import type { Config } from "tailwindcss";

// Isaesteticca — paleta "espresso & latão"
// Base escura profunda (noir/ink) para hero e rodapé, marfim quente no corpo,
// latão envelhecido como ÚNICO acento. Sem o cream+terracota de sempre.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        noir: "#151010",
        ink: "#241C1A",
        smoke: "#3A2F2B",
        ivory: "#F8F4ED",
        champagne: "#E9DAC4",
        brass: "#A8804A",
        brassLight: "#CBA76B",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-jost)", "system-ui", "sans-serif"],
      },
      maxWidth: { prose: "36rem" },
      letterSpacing: { luxe: "0.18em" },
      boxShadow: {
        lift: "0 18px 40px -22px rgba(21,16,16,0.55)",
      },
    },
  },
  plugins: [],
};

export default config;
