//jshint esversion:6
exports.dayToday = function() {
    const myDate = new Date();
    return myDate.toLocaleDateString('en-US', {weekday: 'long'});
}

exports.dayNumberToday = function() {
    const myDate = new Date();
    return myDate.getDay();
}