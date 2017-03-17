var gulp = require('gulp'),
    gutil = require('gulp-util'),
    filelist = require('gulp-filelist'),
    reduce = require('gulp-reduce-async'),
    clean = require('gulp-clean'),
    rename = require("gulp-rename");
var pdfText = require('pdf-text');
var _ = require('underscore');
var sh = require('shorthash');

var natural = require('natural');
var regextokenizer = new natural.RegexpTokenizer({
    pattern: /[^0-9A-Za-z]/
});

var folders = ['term-4', 'term-5', 'term-6'];
var originalSources = './coursepdf/**/*.pdf';
var filesToDownload = './public/courses/**/*.pdf';
// var watcher = gulp.watch(originalSources, ['enumerateFiles']);

// create a default task and just log a message
gulp.task('default', ['createInfoJSON'], function() {
       return gutil.log('Gulp is done');

});
//TODO gulp series only available from Gulp 4
// gulp.task('maintainCourses',gulp.series('emptyDirectory','cleanPDFNames','enumeratePDFFiles','enumerateCourses','createInfoJSON',done=>{
//     console.log('Finished maintenance activity');
// }));

gulp.task('cleanPDFNames', ['emptyDirectory'], function() {
    gulp.src(originalSources, {
        base: './coursepdf'
    }).pipe(rename(path => {
        var name = path.basename;
        var arr = regextokenizer.tokenize(name);
        var newname = arr.filter(word => !/outline|^\d+$/gi.test(word)).join('-');
        path.basename = newname.length >= 1 ? newname : name;
    })).pipe(gulp.dest('./public/courses/'));
});

gulp.task('emptyDirectory', function() {
    return gulp.src('./public/courses', {
            read: false
        })
        .pipe(clean());
});

gulp.task('enumeratePDFFiles', function() {
    gulp
        .src(originalSources)
        .pipe(filelist('filelist.json', {
            relative: true
        }))
        .pipe(gulp.dest('coursepdf'));
});

gulp.task('enumerateCourses', function() {
    gulp
        .src(filesToDownload)
        .pipe(filelist('courselist.json', {
            relative: true,
            removeExtensions: true
        }))
        .pipe(gulp.dest('.'));
});

gulp.task('createInfoJSON', function() {
    gulp
        .src('./public/courses/**/*.pdf')
        .pipe(reduce(function(final, contents, file, cb) {
            // console.dir(contents);
            console.log(file.path);
            var buffer = contents;
            var name = file.relative.replace(/\.\w+$/i,'').replace(/term-\d/,'').replace(/\\/g,'');
            var error,object={};
            pdfText(file.path, function(err, chunks) {              
              try{
                let string = chunks.join(' ');
                //try to get keywords for course;
                let credits = /(\d+(\.\d+)?)[^\w]+?credits?|credits?[^\w]+?(\d+(\.\d+)?)/i.exec(string);
                credits = _.isEmpty(credits)?undefined:credits;
                let profs = chunks.map(chunk=>/instructor[^\w]+(.*?)$|prof[^\w]+(.*?)$/i.test(chunk)?/instructor[^\w]+(.*?)$|prof[^\w]+(.*?)$/i.exec(chunk)[0]:false);
               
                let term = parseInt(file.path.split(/-/i)[1]);
                                              

                let email = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i.exec(string);
                object.id = sh.unique(name);
                object.course = name.replace(/-/g,' ');
                object.contact = _.isEmpty(email)?'No email provided':email[0];
                object.term = term;
                object.credits = credits?parseFloat(credits[0].replace(/[^\d.]/g,'')):0;
                object.credits = object.credits>2?0:object.credits;
                object.rawText = string;
                object.pdf = file.relative.replace(/\\/g,'/');                
              }catch(e){
                error = e;
                console.log('Errored out!');
                console.error(error);
              }finally{
                final = final+JSON.stringify(object)+",";
                return cb(error, final);
              }                
            });
        }, ''))
        .pipe(rename('coursedetails.txt'))
        .pipe(gulp.dest('.'));
});