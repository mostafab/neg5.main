
/**
* Renders the home screen using the response object and index.jade
* @param req The request object sent to the server
* @param res The response object send from the server back to the client
*/
exports.render = (req, res) => {
    res.render("index", {title : "Neg 5",
                        message : "Quizbowl for the Cloud",
                        errormsg : ""
    });
};
