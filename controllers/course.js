var jsonfile = require('jsonfile');
module.exports = {
    renderCourse: renderCourse
};

function renderCourse(req, res) {
    var json = jsonfile.readFileSync('coursedetails.json');
    var course = json.find(obj => {
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