var mongoClient = require('mongodb').MongoClient;

module.exports = {
    server: function (url) {
        this._url = url;
        this._notNext = false;
        this._request = {
            updateRequest: function (newCondition) {
                if (this['$and'] !== undefined) {
                    this['$and'].push(newCondition);
                } else {
                    this['$and'] = [newCondition];
                }
            }
        };
        return this;
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
        var condition = {};
        if (this._notNext) {
            condition[this._field] = { $gte: n};
            this._notNext = false;
        } else {
            condition[this._field] = { $lt: n};
        }
        this._request.updateRequest(condition);
        return this;
    },

    greatThan: function (n) {
        condition = {};
        if (this._notNext) {
            condition[this._field] = { $lte: n};
            this._notNext = false;
        } else {
            condition[this._field] = { $gt: n};
        }
        this._request.updateRequest(condition);
        return this;
    },

    include: function (words) {
        var condition = {};
        if (this._notNext) {
            condition[this._field] = { $nin: words};
            this._notNext = false;
        } else {
            condition[this._field] = { $in: words};
        }
        this._request.updateRequest(condition);
        return this;
    },

    equal: function (word) {
        var condition = {};
        if (this._notNext) {
            condition[this._field] = { $neq: word};
            this._notNext = false;
        } else {
            condition[this._field] = { $eq: word};
            condition[this._field] = { $eq: word};
        }
        this._request.updateRequest(condition);
        return this;
    },

    not: function () {
        this._notNext = !this._notNext;
        return this;
    },

    find: function (callback) {
        var req = {
            $and: this._request.$and
        };
        var url = this._url;
        var collectionName = this._collectionName;
        mongoClient.connect(url, function (err, db) {
            db.collection(collectionName)
                .find(req)
                .toArray(function (err, docs) {
                    callback(err, docs);
                    db.close();
            });
        });
    }
};
