const cheerio = require("cheerio");
const axios = require("axios");


const torrent1337 = async (query, page=1) => {
     let response = [];
   const url = `https://www.1337xx.to/search/${query}/${page}/`;
   try {
      const htmlData = await axios.get(url);
      const $ = cheerio.load(htmlData.data);
      const links = $("td.name")
         .map((_, element) => {
            var link = "https://1337xx.to" + $(element).find("a").next().attr("href");
            return link;
         })
         .get();

      await Promise.all(
         links.map(async (element) => {
            const data = {};
            const labels = ["Category", "Type", "Language", "Size", "UploadedBy", "Downloads", "LastChecked", "DateUploaded", "Seeders", "Leechers"];
            let html;
            try {
               html = await axios.get(element);
            } catch {
               return null;
            }
            const $ = cheerio.load(html.data);
            data.Name = $(".box-info-heading h1").text().trim();
            data.Magnet = $(".clearfix ul li a").attr("href") || "";
            const poster = $("div.torrent-image img").attr("src");

            if (typeof poster !== "undefined") {
               if (poster.startsWith("http")) {
                  data.Poster = poster;
               } else {
                  data.Poster = "https:" + poster;
               }
            } else {
               data.Poster = "";
            }

            $("div .clearfix ul li > span").each((i, element) => {
               $list = $(element);
               data[labels[i]] = $list.text();
            });
            data.Url = element;

            response.push(data);
         })
      );

      return response;
   } catch (error) {
      return null;
   }
};

module.exports = torrent1337









////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////


// const cheerio = require("cheerio");
// const axios = require("axios");

async function bitSearch(query) {
   var ALLTORRENT = [];
   const url = `https://bitsearch.to/search?q=${query}&sort=seeders`;
   let html;
   try {
      html = await axios.get(
         url,
         // (headers = {
         //    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.5790.170 Safari/537.36",
         // })
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
