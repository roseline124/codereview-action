import * as core from "@actions/core";
import i18n from "i18next";
import Backend from "i18next-fs-backend";
import "./i18n-types"; // bring the types

const language = core.getInput("language");

i18n.use(Backend).init({
  fallbackLng: "en",
  lng: language, // default: 'en'
  backend: {
    loadPath: __dirname + "/locales/{{lng}}.json",
  },
  debug: true,
});

export default i18n;
