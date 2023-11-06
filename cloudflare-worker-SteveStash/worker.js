import yaml from "./js-yaml.js";

const targetUrl = `https://raw.githubusercontent.com/Saszr/proxy-server-rule-tools/main/cloudflare-worker-SteveStash/SteveStash.yaml`;

function isURL(str) {
  try {
    new URL(str);
    return true;
  } catch (error) {
    return false;
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const startIndex =
      url.href.indexOf(`${url.origin}/`) + `${url.origin}/`.length;
    const subUrl = url.href.substring(startIndex);

    if (!isURL(subUrl)) {
      return new Response(
        JSON.stringify({ msg: "Wrong subscription address" })
      );
    }

    const subUrlObj = new URL(subUrl);

    const response = await fetch(targetUrl);
    const data = await response.text();

    const obj = yaml.load(data);
    obj["proxy-providers"] = {
      SF: {
        url: subUrl,
        type: "http",
        path: `./profiles/proxies/${subUrlObj.hostname}-sub.yaml`,
        interval: 3600,
        "health-check": {
          enable: true,
          url: "http://www.gstatic.com/generate_204",
          interval: 300,
        },
      },
    };
    const modifiedYaml = yaml.dump(obj);

    return new Response(modifiedYaml);
  },
};
