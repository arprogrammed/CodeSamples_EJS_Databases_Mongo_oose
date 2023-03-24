//jshint esversion:6
exports.Blogpost = function(title,body) {

    let options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long"
    };
    let myDate = new Date();
    let postDate = myDate.toLocaleString('en-US', options);
    let key = title.replace(/[^\w\s]/,"").replaceAll(" ", "-").toLowerCase();
    let bdytrunc = body.slice(0, 140);

    this.key = key;
    this.dte = postDate;
    this.tlt = title;
    this.bdy = body;
    this.trn = bdytrunc;

}

