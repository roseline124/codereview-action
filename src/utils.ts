import * as core from "@actions/core";

export const debug = (json: Record<string, any>) => {
  core.debug(JSON.stringify(json, null, 2));
};
