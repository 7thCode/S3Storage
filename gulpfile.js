const gulp = require('gulp');
const typescript = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');

const configured_typescript = typescript.createProject("server_tsconfig.json");

gulp.task('compile', function() {

	return gulp.src([
		'main.ts',
		'server/**/*.ts',
	], {base: './'})
		.pipe(sourcemaps.init())
		.pipe(configured_typescript())
		.js
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./'));
});

gulp.task('default', gulp.series('compile'), function() {

});
