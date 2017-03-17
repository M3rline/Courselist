var jsonfile = require('jsonfile');

module.exports = {
    renderCourse: renderCourse
};

function renderCourse(req, res) {    
    var course = json.find(obj => {
        var json = jsonfile.readFileSync('coursedetails.json');
        return obj.id === req.params.id;
    });
    if (!course)
        res.status(500).send('Unable to find course. Please check your id');
    else
        res.status(200).render('course', {
            title: course.name,
            course: course
        });
}