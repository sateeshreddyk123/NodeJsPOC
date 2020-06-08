var server = require("cloudcms-server/server");

var routes = function (app, callback)
{
    app.get("/api/books", function(req, res) {
        let query = {
            _type: "store:book"
        };
        if (req.query.tag)
        {
            query.tags = req.query.tag;
        }

        req.branch(function(err, branch) {
            branch.trap(function(err) {
                return res.status(500).json(err);
            }).queryNodes(query).each(function() {
                this.imageUrl = "/static/" + this._doc + "-image.jpg?repository=" + this.getRepositoryId() + "&branch=" + this.getBranchId() + "&node=" + this.getId();
                this.authorTitle = this.author.title;
            }).then(function() {
                return res.status(200).json(this);
            });
        });
    });

    app.get("/api/books/:id", function(req, res) {
        const bookId = req.params.id;

        req.branch(function(err, branch) {
            branch.trap(function(err) {
                return res.json(err);
            }).readNode(bookId)
            .then(function() {
                this.imageUrl = "/static/" + this._doc + "-image.jpg?repository=" + this.getRepositoryId() + "&branch=" + this.getBranchId() + "&node=" + this.getId();
                this.pdfUrl = "/static/" + this._doc + "-pdf.jpg?repository=" + this.getRepositoryId() + "&branch=" + this.getBranchId() + "&node=" + this.getId() + "&attachment=book_pdf";
                this.authorTitle = this.author.title;  
                
                const self = this;
                this.recommendations.forEach(function(rec) {
                    rec._doc = rec.id;
                    rec.imageUrl = "/static/" + rec._doc + "-image.jpg?repository=" + self.getRepositoryId() + "&branch=" + self.getBranchId() + "&node=" + rec._doc;
                });           
                return res.status(200).json(this);
            });
        });
    });

    app.get("/api/authors", function(req, res) {
        req.branch(function(err, branch) {
            branch.trap(function(err) {
                return res.status(500).json(err);
            }).queryNodes({
                _type: "store:author"
            }).each(function() {
                this.imageUrl = "/static/" + this._doc + "-image.jpg?repository=" + this.getRepositoryId() + "&branch=" + this.getBranchId() + "&node=" + this.getId();
            }).then(function() {
                return res.status(200).json(this);
            });
        });
    });

    app.get("/api/search", function(req, res) {
        const text = req.query.text;

        req.branch(function(err, branch) {
            branch.trap(function(err) {
                return res.status(500).json(err);
            }).findNodes({
                search: text,
                query: {
                    _type: "store:book"
                }
            }).each(function() {
                this.imageUrl = "/static/" + this._doc + "-image.jpg?repository=" + this.getRepositoryId() + "&branch=" + this.getBranchId() + "&node=" + this.getId();
            }).then(function() {
                return res.status(200).json(this);
            });
        });
    });

    app.get("/api/tags", function(req, res) {
        req.branch(function(err, branch) {
            branch.trap(function(err) {
                return res.status(500).json(err);
            }).queryNodes({
                _type: "n:tag"
            }, {
                sort: {
                    tag: 1
                }
            }).then(function() {
                return res.status(200).json(this);
            });
        });
    });

    callback();
};

server.routes(routes);

server.report(function(callback) {

    var cpuCount = require('os').cpus().length;

    // provide some debug info
    console.log("");
    console.log("Sample App Started Up");
    console.log("");
    console.log("Node Version: " + process.version);
    console.log("Server Version: " + process.env.CLOUDCMS_APPSERVER_PACKAGE_VERSION);
    console.log("Server Mode: " + process.env.CLOUDCMS_APPSERVER_MODE);
    console.log("Server Base Path: " + process.env.CLOUDCMS_APPSERVER_BASE_PATH);
    console.log("Gitana Scheme: " + process.env.GITANA_PROXY_SCHEME);
    console.log("Gitana Host: " + process.env.GITANA_PROXY_HOST);
    console.log("Gitana Port: " + process.env.GITANA_PROXY_PORT);
    console.log("Temp Directory: " + process.env.CLOUDCMS_TEMPDIR_PATH);
    console.log("CPU Count: " + cpuCount);
    console.log("Store Configuration: " + process.env.CLOUDCMS_STORE_CONFIGURATION);
    console.log("Broadcast Provider: " + process.env.CLOUDCMS_BROADCAST_TYPE);
    console.log("Cache Provider: " + process.env.CLOUDCMS_CACHE_TYPE);
    console.log("LaunchPad Mode: " + process.env.CLOUDCMS_LAUNCHPAD_SETUP);
    console.log("Server mode: " + (process.env.NODE_ENV ? process.env.NODE_ENV : "development"));
    console.log("");
    console.log("Web Server: http://localhost:" + process.env.PORT);
    console.log("");

    callback();
});

server.start({
    "setup": "single",
    "welcome": {
        "enabled": true,
        "file": "index.html"
    },
    "wcm": {
        "enabled": true,
        "cache": false
    },
    "cache": {
        "enabled": true
    },
    "autoRefresh": {
        "log": true
    },
    "perf": {
        "enabled": true,
        "paths": [{
            "regex": "/static/.*",
            "cache": {
                "seconds": 300
            }
        }]
    }
});







