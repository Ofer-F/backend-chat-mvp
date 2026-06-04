import { createApp } from "./app";
import { config } from "./config";
import { seed } from "./store/seed";

seed();

const app = createApp();

app.listen(config.PORT, () => {
    console.log(`Server listening on http://localhost:${config.PORT}`);
});
