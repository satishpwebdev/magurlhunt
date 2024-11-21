// const cheerio = require("cheerio");
// const axios = require('axios')
// const exampleScrap = async() => {
//   let allTitle =[]
//   let url = 'https://www.tricksnomy.com'
//   try {
//    const html = await axios.get(url)
//    const $ = cheerio.load(html.data)
//    const titles = $('.post-outer').map((_, element)=>{
//       const title = $(element).find('.entry-title > a').text()
//       return title
//    }).get()
//    console.log(titles)
//   } catch (error) {
   
//   }
// };

// module.exports = exampleScrap;


const cheerio = require("cheerio");
const axios = require("axios");
const { SocksProxyAgent } = require("socks-proxy-agent");

// const proxyHost = "104.21.14.91";
// const proxyPort = 80;


// const proxyHost = '64.29.70.4';
// const proxyPort = 55554;
// const proxyUsername = 'sattu3911';
// const location = '';
// const type = 1;
// const password = '9F3B50952DB15FC1F3C14BE3ECCE7B03';
// const passwordJson = {
//   p: password,
//   l: location,
//   t: type,
  
// };


const info = {
  hostname: '64.29.70.4',
  port: 55554,
  userId: 'sattu3911',
  password: '9F3B50952DB15FC1F3C14BE3ECCE7B03'
};

const proxyUrl = `socks5://${info.userId}:${info.password}@${info.host}:${info.port}`;
const agent = new SocksProxyAgent(proxyUrl);



// Proxy password to use as Base64
// const passwordB64 = Buffer.from((JSON.stringify(passwordJson))).toString('base64');

// const proxyUrl = `socks5://${proxyUsername}:${passwordB64}@${proxyHost}:${proxyPort}`;

const torrent1337 = async (query, page = 1) => {
  let response = [];
  const url = `https://www.1337xx.to/search/${query}/${page}/`;

  // const proxyUrl = `socks5://${proxyHost}:${proxyPort}`;
  // const proxyUrl = `socks5://191.102.176.20:9868`;
  // const socksAgent = new SocksProxyAgent(proxyUrl);

  try {
    const htmlData = await axios.get(url, {
      // httpsAgent: socksAgent,
      httpsAgent: agent,
    });
    const $ = cheerio.load(htmlData.data);
    const links = $("td.name")
      .map((_, element) => {
        var link =
          "https://1337xx.to" + $(element).find("a").next().attr("href");
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
          "Leechers",
        ];
        let html;
        try {
          html = await axios.get(element, {
            // httpsAgent: socksAgent,
            httpsAgent: agent,
          });
        } catch (error) {
          console.error("Error fetching individual torrent page:", error);
          return null; // Return early if there's an error.
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
    console.error("Error fetching main search page:", error);
    return null; // Return early if there's an error.
  }
};

module.exports = torrent1337;

