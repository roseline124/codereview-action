import * as core from "@actions/core";
import i18n from "i18next";
import Backend from "i18next-fs-backend";
import path from "path";
import "./types"; // bring the types

const language = core.getInput("language");

export const initI18n = async () => {
  await i18n.use(Backend).init({
    fallbackLng: "en",
    lng: language, // default: 'en'
    backend: {
      loadPath: path.join(__dirname, "locales", "{{lng}}.json"),
    },
    interpolation: {
      escapeValue: false, // disalbe HTML encoding
    },
    debug: true,
  });
};
