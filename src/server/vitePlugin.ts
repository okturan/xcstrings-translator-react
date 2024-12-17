import { Plugin } from "vite";
import * as path from "path";
import { LocalizableStringsManager } from "../utils/LocalizableStringsManager";
import { createSaveTranslationMiddleware } from "./middleware";

export function saveTranslationPlugin(): Plugin {
  return {
    name: "save-translation",
    configureServer(server) {
      const manager = new LocalizableStringsManager(
        path.resolve("./public/Localizable.xcstrings")
      );
      server.middlewares.use(createSaveTranslationMiddleware(manager));
    },
  };
}
