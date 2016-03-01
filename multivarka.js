var mongoClient = require('mongodb').MongoClient;

module.exports = {
    server: function (_url) {
        this.url = _url;
        this.notNext = false;
        return this;
    },

    collection: function (_collectionName) {
        this.collectionName = _collectionName;
        return this;
    },

    where: function (key) {
        this.field = key;
        return this;
    },

    lessThan: function (n) {
        var newRequest = {};
        if (!this.notNext) {
            newRequest[this.field] = {$lt: n};
        } else {
            newRequest[this.field] = { $gte: n};
            this.notNext = false;
        }
        this.request = createRequest(this.request, newRequest);
        return this;
    },

    greatThan: function (n) {
        var newRequest = {};
        if (!this.notNext) {
            newRequest[this.field] = {$gt: n};
        } else {
            newRequest[this.field] = { $lte: n};
            this.notNext = false;
        }
        this.request = createRequest(this.request, newRequest);
        return this;
    },

    include: function (words) {
        var newRequest = {};
        if (!this.notNext) {
            newRequest[this.field] = {$in: words};
        } else {
            newRequest[this.field] = { $nin: words};
            this.notNext = false;
        }
        this.request = createRequest(this.request, newRequest);
        return this;
    },

    equal: function (word) {
        var newRequest = {};
        if (!this.notNext) {
            newRequest[this.field] = { $eq: word};
        } else {
            newRequest[this.field] = { $ne: word};
            this.notNext = false;
        }
        this.request = createRequest(this.request, newRequest);
        return this;
    },

    not: function () {
        this.notNext = true;
        return this;
    },

    find: function (callback) {
        var req = this.request;
        var url = this.url;
        var collectionName = this.collectionName;
        mongoClient.connect(url, function (err, db) {
            var collect = db.collection(collectionName.toString());
            collect.find(req).toArray(function (err, docs) {
                callback(err, docs);
                db.close();
            });
        });
    }
};

function createRequest(oldRequest, newRequest) {

    if (oldRequest !== undefined) {
        oldRequest.push(newRequest);
    } else {
        oldRequest = { $and: [newRequest]};
    }

    return oldRequest;
}
