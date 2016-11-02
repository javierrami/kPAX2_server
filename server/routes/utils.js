

// Aux Function
// TODO: parse query string
module.exports.isJsonString = function(str) {
	// For testing if str is a well formed JSON chain
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
} ;
