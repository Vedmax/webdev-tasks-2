var mongoClient = require('mongodb').MongoClient;

function createSession(serverName) {
    return {
        _url: serverName,
        _notNext: false,
        _request: {},
        _updateRequest: function (newCondition) {
            if (this._request[this._field] === undefined) {
                this._request[this._field] = newCondition;
            } else {
                var key = Object.keys(newCondition)[0];
                this._request[this._field][key] = newCondition[key];
            }
        },

        collection: function (collectionName) {
            this._collectionName = collectionName;
            return this;
        },

        where: function (key) {
            this._field = key;
            return this;
        },

        lessThan: function (n) {
            if (this._notNext) {
                var condition = { $gte: n};
                this._notNext = false;
            } else {
                condition = { $lt: n};
            }
            this._updateRequest(condition);
            return this;
        },

        greatThan: function (n) {
            if (this._notNext) {
                var condition = { $lte: n};
                this._notNext = false;
            } else {
                condition = { $gt: n};
            }
            this._updateRequest(condition);
            return this;
        },

        include: function (words) {
            if (this._notNext) {
                condition = { $nin: words};
                this._notNext = false;
            } else {
                condition = { $in: words};
            }
            this._updateRequest(condition);
            return this;
        },

        equal: function (word) {
            if (this._notNext) {
                var condition = { $neq: word};
                this._notNext = false;
            } else {
                condition = { $eq: word};
            }
            this._updateRequest(condition);
            return this;
        },

        not: function () {
            this._notNext = !this._notNext;
            return this;
        },

        find: function (callback) {
            var req = this._request;
            var url = this._url;
            var collectionName = this._collectionName;
            if (collectionName === undefined) {
                console.log('Set collection before finding');
                return this;
            }
            mongoClient.connect(url, function (err, db) {
                db.collection(collectionName)
                    .find(req)
                    .toArray(function (err, docs) {
                        callback(err, docs);
                        db.close();
                    });
            });
            this._request = {};
            this._field = {};
            return this;
        }
    };
}

module.exports = {
    server: function (url) {
        return createSession(url);
    }
};
