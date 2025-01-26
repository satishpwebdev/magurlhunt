const Controller = require("./controller");
const Seedr = require("../services/Seedr");

class SeedrController extends Controller {
  constructor(response = null) {
    super(response);
  }

  async getAFF(req, res) {
    try {
      const token = req.query.token;

      if (!token) {
        return this.sendError(res, {
          message: "Token is required",
        });
      }

      const seedr = new Seedr();
      const data = await seedr.getAFF(token);

      console.log(
        "Available files:",
        data.files?.map((file) => ({
          id: file.id,
          folder_file_id: file.folder_file_id,
          name: file.name,
        }))
      );

      return this.sendResponse(res, data);
    } catch (error) {
      console.error("Get videos controller error:", error);
      return this.sendError(res, {
        message: error.message || "Failed to get videos",
      });
    }
  }

  async addMagnet(req, res) {
    try {
      const magnetLink = req.body.magnet || req.query.magnet;
      const token = req.body.token || req.query.token;

      if (!magnetLink) {
        return this.sendError(res, {
          message: "Magnet link is required",
        });
      }

      if (!token) {
        return this.sendError(res, {
          message: "Token is required",
        });
      }

      const seedr = new Seedr();
      const result = await seedr.addMagnet(magnetLink, token);

      return this.sendResponse(res, result);
    } catch (error) {
      console.error("Add magnet controller error:", error);
      return this.sendError(res, {
        message: error.message || "Failed to add magnet",
      });
    }
  }

  async deleteFile(request) {
    const seedr = new Seedr();
    const data = await seedr.deleteFile(request.query.q);
    this.sendResponse(data);
  }

  async deleteFolder(request) {
    const seedr = new Seedr();
    const data = await seedr.deleteFolder(request.query.q);
    this.sendResponse(data);
  }

  async getDeviceCode(request) {
    const seedr = new Seedr();
    const data = await seedr.getDeviceCode();
    this.sendResponse(data);
  }

  async getToken(request) {
    const seedr = new Seedr();
    const data = await seedr.getToken(request.query.q);
    this.sendResponse(data);
  }

  async addToken(request) {
    const seedr = new Seedr();
    const data = await seedr.addToken(request.query.q);
    this.sendResponse(data);
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return this.sendError(
          res,
          {
            message: "Username and password are required",
          },
          400
        );
      }

      const seedr = new Seedr();
      const result = await seedr.login(username, password);

      return this.sendResponse(res, {
        success: true,
        token: result.token,
        refresh_token: result.refresh_token,
      });
    } catch (error) {
      console.error("Login controller error:", error);
      return this.sendError(
        res,
        {
          message: "Login failed - please check your credentials",
        },
        401
      );
    }
  }

  ////////////////////////////////////////////

  async getFile(req, res) {
    try {
      const fileId = req.query.fileId;
      const token = req.query.token;

      if (!fileId || !token) {
        return res
          .status(400)
          .json({ success: false, message: "File ID and token are required" });
      }

      const seedr = new Seedr();
      const result = await seedr.getFile(fileId, token);

      return res.status(200).json({ success: true, data: result.data });
    } catch (error) {
      console.error("Get file controller error:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: error.message || "Failed to get file",
        });
    }
  }
}

module.exports = SeedrController;
