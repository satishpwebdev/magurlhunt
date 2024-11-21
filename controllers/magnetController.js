const Controller = require("./controller");
const torren1337 = require("../services/1337x");
// const torren1337 = require("../services/1337_x");
const bitSearch = require("../services/bitSearch");
const torLock = require("../services/torlock");
const torProject = require("../services/torproject");

class MagnetController extends Controller {
  constructor(response) {
    super(response);
  }

  async search(request) {
    const { search } = request.query;

    try {
      const [torren1337Results, bitSearchResults, torResults, torProjectResults] = await Promise.all([
        torren1337(search).catch((error) => {
          console.error("Error from torren1337:", error);
          return [];
        }),
        bitSearch(search).catch((error) => {
          console.error("Error from bitSearch:", error);
          return [];
        }),
        torLock(search).catch((error) => {
          console.error("Error from bitSearch:", error);
          return [];
        }),
        torProject(search).catch((error) => {
          console.error("Error from bitSearch:", error);
          return [];
        })
      ]);

      const validTorren1337Results = torren1337Results?.filter((result) => {
        return result.Magnet && result.Magnet.startsWith("magnet:");
      });

      const validtorProjectResults = torProjectResults?.filter((result) => {
        return result.Magnet && result.Magnet.startsWith("magnet:");
      });
      const validtortorResults = torResults?.filter((result) => {
        return result.Magnet && result.Magnet.startsWith("magnet:");
      });
      const validbitSearchResults = bitSearchResults?.filter((result) => {
        return result.Magnet && result.Magnet.startsWith("magnet:");
      });

      const combinedResults = [
        ...(validTorren1337Results || []),
        ...(validtortorResults || []),
        ...(validbitSearchResults || []),
        ...(validtorProjectResults || [])
      ];

      combinedResults.sort((a, b) => b.seeders - a.seeders);

      const top30Results = combinedResults.slice(0, 30);

      this.sendResponse(top30Results);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = MagnetController;
