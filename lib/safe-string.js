module.exports = SafeString;


function SafeString(string) {
    this.string = typeof string === 'string' ?
            string : '' + string;
}


SafeString.prototype.toString =
SafeString.prototype.toHTML = function () {
    return this.string;
};

