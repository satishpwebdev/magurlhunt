

 class Controller {
   constructor(response) {
      this.response = response;
   }

   sendResponse(data) {
      this.response.status(200).json(data);
   }

   sendError(data){
      this.response.status(409).json(data);

   }
}


module.exports = Controller