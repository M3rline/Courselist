var jsonfile = require('jsonfile');
var nlp = require('nlp_compromise');
var _ = require('underscore');
module.exports = {
    renderHome: renderHome,
    redirectHome: redirectHome
};


function renderHome(req, res) {
    var details = jsonfile.readFileSync('coursedetails.json');
    var term4 = details.filter(course => course.term === 4);
    var term5 = details.filter(course => course.term === 5);
    var term6 = details.filter(course => course.term === 6);
    res.render('home', {
        title: 'PGP courses and details',
        courses: details,
        term4: term4,
        term5: term5,
        term6: term6,
        helpers: {
            getCardClass: function(credits) {
                let classes = ['blue-grey darken-1', 'purple darken-2', 'lime darken-2', 'deep-purple darken-2', 'teal darken-1', 'indigo darken-2'];
                let ch = parseInt(credits * 4) || 0;
                ch = ch % 6;
                return classes[ch];
            }
        }
    });
}

function redirectHome(req, res) {
    res.redirect('/home');
}

function renderPage(req, res) {
    res.status(202).send('Sorry ' + req.params.pagename + ' isnt quite ready yet! Go <a href="/home">Home</a>')
}