import { env } from "./env";                  
import { AppDataSource } from "./data-source";
import { createApp } from "./app";           

async function main() {
  try {

    await AppDataSource.initialize();
    console.log("-----------------Database connected-----------------");

    const app = createApp();

    app.listen(env.PORT, () => {
      console.log(`+++++++++++++++++API is running on http://localhost:${env.PORT}+++++++++++++++++`);
      console.log(`Swagger docs at - http://localhost:${env.PORT}/docs`);
    });
  } catch (err) {
    console.error("Failed to start API:", err);
    process.exit(1);
  }
}

main();
