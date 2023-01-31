class Resolve {
    success(msg = 'success', errorCode = 1, code = 200) {
        return { msg, errorCode, code };
    }
    json(data, msg = 'success', errorCode = 1, code = 200) {
        return { msg, errorCode, code, data, };
    }
}
const resolve = new Resolve();
module.exports = resolve;
