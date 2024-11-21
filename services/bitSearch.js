const cheerio = require("cheerio");
const axios = require("axios");

const https = require('https'); 
const http = require('http'); 
const { SocksProxyAgent } = require("socks-proxy-agent");


require("dotenv").config();

const info = {
  hostname: process.env.HOST_NAME,
  port: process.env.HOST_PORT,
  userId: process.env.HOST_USERID,
  password: process.env.HOST_PASS
};

// const proxyUrl = `socks5h://${info.userId}-rotate:${info.password}@${info.hostname}:${info.port}`;
const proxyUrl = `socks5h://${info.userId}:${info.password}@${info.hostname}:${info.port}`;
const proxyAgent = new SocksProxyAgent(proxyUrl);

// Axios instance setup
const axiosInstance = axios.create({
  httpsAgent: proxyAgent,
  httpAgent: proxyAgent
});

// const axiosInstance = axios.create({
//   proxy: false, 
//   httpsAgent: new https.Agent({ 
//     proxy: proxyUrl,
//   }),
//   httpAgent: new http.Agent({ 
//     proxy: proxyUrl,
//   }),
// });

async function bitSearch(query) {
   var ALLTORRENT = [];
   const url = `http://bitsearch.to/search?q=${query}&sort=seeders`;
   let html;
   try {
      html = await axiosInstance.get(
         url,
         (headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36",
         })
      );
   } catch {
      return null;
   }

   const $ = cheerio.load(html.data);
   $("li.search-result").each((_, element) => {
      let size = $(element).find(".info div div").eq(3).text();
      if (size) {
         let torrent = {
            Name: $(element).find(".info .title").text(),
            Size: $(element).find(".info div div").eq(3).text(),
            Seeders: $(element).find(".info div div").eq(4).text().trim(),
            Leechers: $(element).find(".info div div").eq(5).text().trim(),
            Magnet: $(element).find(".links a").eq(1).attr("href"),
         };
         ALLTORRENT.push(torrent);
      }
   });

   return ALLTORRENT;
}

module.exports = bitSearch;
