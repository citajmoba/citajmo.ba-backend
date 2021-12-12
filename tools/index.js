exports.unaccent = (str) => {
    const chars = {'č':'c','ć':'c','đ':'dj','š':'s','ž':'z'};
    return str.replace(/[čćđšž]/gi, m => chars[m]);
}