const cheerio = require("cheerio");
const axios = require("axios");
const { setTimeout } = require("timers");
const { SocksProxyAgent } = require("socks-proxy-agent");

require("dotenv").config();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchDataWithRetry = async (url, retries = 0, maxRetries = 3) => {
  try {
    const response = await axiosInstance.get(url, {
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    if (retries < maxRetries && error.code === "ECONNRESET") {
      console.log(`Connection reset, retrying... Attempt: ${retries + 1}`);
      await delay(1000);
      return fetchDataWithRetry(url, retries + 1, maxRetries);
    } else {
      throw error;
    }
  }
};

const info = {
  hostname: process.env.HOST_NAME,
  port: process.env.HOST_PORT,
  userId: process.env.HOST_USERID,
  password: process.env.HOST_PASS
};

if (!info.hostname || !info.port || !info.userId || !info.password) {
  console.error("Missing necessary environment variables for proxy setup. Check .env file!");
  process.exit(1);
}

const proxyUrl = `socks5h://${info.userId}:${info.password}@${info.hostname}:${info.port}`;
const proxyAgent = new SocksProxyAgent(proxyUrl);

const axiosInstance = axios.create({
  httpsAgent: proxyAgent,
  httpAgent: proxyAgent,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Cache-Control": "max-age=0"
  }
});

const torrent1337 = async (query, page = 1) => {
  let response = [];
  const queryString = encodeURIComponent(query);
  const url = `https://www.1337x.to/search/${queryString}/${page}/`;

  try {
    const htmlData = await fetchDataWithRetry(url);
    const $ = cheerio.load(htmlData);
    const links = $("td.name")
      .map((_, element) => {
        var link = "https://1337x.to" + $(element).find("a").eq(1).attr("href");
        return link;
      })
      .get();

    await Promise.all(
      links.map(async (element) => {
        const data = {};
        const labels = [
          "Category",
          "Type",
          "Language",
          "Size",
          "UploadedBy",
          "Downloads",
          "LastChecked",
          "DateUploaded",
          "Seeders",
          "Leechers"
        ];
        let html;
        try {
          html = await fetchDataWithRetry(element);
        } catch {
          return null;
        }
        const $ = cheerio.load(html);
        data.Name = $(".box-info-heading h1").text().trim();
        data.Magnet = $(".clearfix ul li a").attr("href") || "";
        const poster = $("div.torrent-image img").attr("src");

        if (typeof poster !== "undefined") {
          data.Poster = poster.startsWith("http") ? poster : "https:" + poster;
        } else {
          data.Poster = "";
        }

        $("div .clearfix ul li > span").each((i, element) => {
          const $list = $(element);
          data[labels[i]] = $list.text();
        });

        data.Url = element;
        response.push(data);
      })
    );

    return response;
  } catch (error) {
    console.error("Error fetching search results:", error.message);
    return null;
  }
};

module.exports = torrent1337;
