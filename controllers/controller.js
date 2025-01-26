

//  class Controller {
//    constructor(response) {
//       this.response = response;
//    }

//    sendResponse(data) {
//       this.response.status(200).json(data);
//    }

//    sendError(data){
//       this.response.status(409).json(data);

//    }
// }


class Controller {
  constructor(response) {
    this.response = response;
  }

  sendResponse(resOrData) {
    if (
      resOrData &&
      resOrData.status &&
      typeof resOrData.status === "function"
    ) {
      return resOrData.status(200).json(arguments[1]);
    }
    if (this.response) {
      return this.response.status(200).json(resOrData);
    }
    throw new Error("No response object available");
  }

  sendError(resOrData) {
    if (
      resOrData &&
      resOrData.status &&
      typeof resOrData.status === "function"
    ) {
      return resOrData.status(409).json(arguments[1]);
    }
    if (this.response) {
      return this.response.status(409).json(resOrData);
    }
    throw new Error("No response object available");
  }
}


module.exports = Controller
