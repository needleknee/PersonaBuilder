import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "api-build-persona",
      configureServer(server) {
        return () => {
          server.middlewares.use("/api/build-persona", async (req, res, next) => {
            if (req.method !== "POST") {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: "Method not allowed" }));
              return;
            }

            let body = "";
            req.on("data", (chunk) => {
              body += chunk.toString();
            });

            req.on("end", async () => {
              try {
                const { notes } = JSON.parse(body);

                if (!notes || typeof notes !== "string") {
                  res.statusCode = 400;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ error: "Invalid input: notes required" }));
                  return;
                }

                // Dynamically import buildPersona
                const { buildPersona } = await import("./src/agent/index.ts");

                const result = await buildPersona(notes);

                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(result));
              } catch (error) {
                console.error("Build persona error:", error);
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    error: error instanceof Error ? error.message : "Unknown error",
                  })
                );
              }
            });
          });
        };
      },
    },
  ],
});
