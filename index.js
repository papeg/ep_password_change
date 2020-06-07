var eejs = require('ep_etherpad-lite/node/eejs/');

var crypto = require('crypto');

var fs = require('fs');

var settings = require('ep_etherpad-lite/node/utils/Settings');

var hash_typ = 'sha512';
var hash_dig = 'hex';
var hash_dir = '/var/etherpad/users';
var hash_ext = '/.hash';

if (settings.ep_hash_auth) {
    if (settings.ep_hash_auth.hash_typ) hash_typ = settings.ep_hash_auth.hash_typ;
    if (settings.ep_hash_auth.hash_dig) hash_dig = settings.ep_hash_auth.hash_dig;
    if (settings.ep_hash_auth.hash_dir) hash_dir = settings.ep_hash_auth.hash_dir;
    if (settings.ep_hash_auth.hash_ext) hash_ext = settings.ep_hash_auth.hash_ext;
}

exports.eejsBlock_indexWrapper = function(hook_name, args, cb) {
    args.content += eejs.require('ep_password_change/templates/form.html');
    args.content += eejs.require('ep_password_change/templates/button.html');
    args.content += "<link href='static/plugins/ep_password_change/static/css/modal.css' rel='stylesheet'>";
    cb();
};

exports.registerRoute = function(hook_name, args, cb) {
    args.app.post("/password_change", function(req, res) {
        var username = req.session.user.username;
        var contents = ''

        // check if user is authenticated with settings.json
        if (username in settings.users) {
            if ('password' in settings.users[username] || 'hash' in settings.users[username]) {
                console.log('found authentication' + username + ' in settings.json');
                res.status(422).send();
            }
        }
 
        req.on('data', async function(data) {
            contents += data;
            console.log('data', typeof(data), data.toString());
        });

        req.on('end', async function() {
            console.log('end', contents);
            res.status(204).send();
        });
       /*
        if (req.query.password && req.query.current) {
            var path = hash_dir + "/" + username + "/" + hash_ext;
            var password = Buffer.from(req.query.password, 'base64').toString('ascii');
            var current = Buffer.from(req.query.current, 'base64').toString('ascii');

            // check if hash file is writeable
            try {
                fs.accessSync(path, fs.constants.W_OK);
            } catch (err) {
                console.log(path + 'is not writable');
                res.status(501).send();
            }
            // check current password
            try {
                var contents = fs.readFileSync(path, 'utf8');
                var hash = crypto.createHash(hash_typ).update(current).digest(hash_dig);
                if (hash != contents) {
                    res.status(401).send();
                } else {
                    // write new hash
                    var hash = crypto.createHash(hash_typ).update(password).digest(hash_dig);
                    try {
                        fs.writeFileSync(path, hash);
                        res.status(204).send();
                    } catch (err) {
                        console.log(err);
                        res.status(500).send();
                    }
                }
            } catch (err) {
                console.log(err);
                res.status(500).send();
            }
       } else {
            res.status(400).send();
       }
    */
    });
};
