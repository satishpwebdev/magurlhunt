const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

const base ={
  url: process.env.BASE_URL
}

module.exports = class Seedr {
  constructor() {
    this.username = null;
    this.password = null;
    this.token = null;
    this.rft = null;
    this.baseURL = `${base.url}/oauth_test`;
  }



  async login(username, password) {
    try {
      const formData = new FormData();
      formData.append("grant_type", "password");
      formData.append("client_id", "seedr_chrome");
      formData.append("type", "login");
      formData.append("username", username);
      formData.append("password", password);

      const response = await axios({
        method: "post",
        url: `${this.baseURL}/token.php`,
        data: formData,
        headers: formData.getHeaders(),
      });

      if (!response.data || !response.data.access_token) {
        throw new Error("Invalid login response");
      }

      return {
        success: true,
        token: response.data.access_token,
        refresh_token: response.data.refresh_token,
      };
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      throw new Error("Login failed");
    }
  }

  

  async getDeviceCode() {
    var dc = await axios(
      "https://www.seedr.cc/api/device/code?client_id=seedr_xbmc"
    );
    this.devc = dc.data["device_code"];
    this.usc = dc.data["user_code"];
    console.log(
      `Paste this code into Seedr ${this.usc} || And here is your token ${this.devc}`
    );
    return this.usc;
  }

  async getToken(devc) {
    var token = await axios(
      `${base.url}/api/device/authorize?device_code=${devc}&client_id=seedr_xbmc`
    );
    this.token = token.data["access_token"];
    return this.token;
  }

  async addToken(token) {
    this.token = token;
  }

  
  async addMagnet(magnetLink, token) {
    try {
      if (!magnetLink) {
        throw new Error("Magnet link is required");
      }

      if (!token) {
        throw new Error("Token is required");
      }

      const formData = new FormData();
      formData.append("access_token", token);
      formData.append("func", "add_torrent");
      formData.append("torrent_magnet", magnetLink);

      const response = await axios({
        method: "post",
        url: `${base.url}/oauth_test/resource.php`,
        headers: formData.getHeaders(),
        data: formData,
      });

      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Add magnet error:", error);
      throw new Error(
        error.response?.data?.message || error.message || "Failed to add magnet"
      );
    }
  }


  async getAFF(token) {
    try {
      if (!token) {
        throw new Error("Token is required");
      }

      const folderResponse = await axios(
        `${base.url}/api/folder?access_token=${token}`
      );

      if (!folderResponse.data || !folderResponse.data.folders) {
        throw new Error("Failed to fetch folders");
      }

      const res = [];

      for (const folder of folderResponse.data.folders) {
        const folderDetailsResponse = await axios(
          `${base.url}/api/folder/${folder.id}?access_token=${token}`
        );

        if (!folderDetailsResponse.data || !folderDetailsResponse.data.files) {
          console.warn(`No files found in folder: ${folder.id}`);
          continue; 
        }

        const allFiles = folderDetailsResponse.data.files.map((x) => ({
          fid: folder.id, 
          id: x["folder_file_id"], 
          name: x.name, 
          type: x.type, 
        }));

        if (allFiles.length > 0) {
          res.push({
            folderId: folder.id, 
            folderName: folder.name, 
            files: allFiles, 
          });
        } else {
          console.warn(`No files found in folder: ${folder.id}`);
        }
      }

      return {
        success: true,
        files: res, 
      };
    } catch (error) {
      console.error("Get files error:", error);
      throw new Error(
        error.response?.data?.message || error.message || "Failed to get files"
      );
    }
  }


  async deleteFolder(id) {
    var data = new FormData();
    data.append("access_token", this.token);
    data.append("func", "delete");
    data.append(
      "delete_arr",
      JSON.stringify([
        {
          type: "folder",
          id: id,
        },
      ])
    );

    var res = await axios({
      method: "post",
      url: `${base.url}/oauth_test/resource.php`,
      headers: data.getHeaders(),
      data: data,
    });
    return res.data;
  }

  async deleteFile(id) {
    var data = new FormData();
    data.append("access_token", this.token);
    data.append("func", "delete");
    data.append(
      "delete_arr",
      JSON.stringify([
        {
          type: "file",
          id: id,
        },
      ])
    );

    var res = await axios({
      method: "post",
      url: `${base.url}/oauth_test/resource.php`,
      headers: data.getHeaders(),
      data: data,
    });
    return res.data;
  }
 

 

  async getFile(fileId, token) {
    try {
      if (!fileId || !token) {
        throw new Error("File ID and token are required");
      }

      const formData = new URLSearchParams();
      formData.append("access_token", token);
      formData.append("func", "fetch_file");
      formData.append("folder_file_id", fileId);

      console.log("Making file request:", {
        fileId,
        tokenLength: token.length,
        func: "fetch_file",
      });

      const response = await axios({
        method: "post",
        url: `${base.url}/oauth_test/resource.php`,
        data: formData.toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      });

      if (response.data === "access_denied !") {
        throw new Error("Access denied");
      }

      if (!response.data || response.data.error) {
        throw new Error(response.data?.error || "Failed to fetch file");
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Get file error:", {
        message: error.message,
        response: error.response?.data || "No response data",
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data,
        },
      });
      throw error;
    }
  }
};
