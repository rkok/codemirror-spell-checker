"use strict";

var gulp = require("gulp"),
	minifycss = require("gulp-clean-css"),
	uglify = require("gulp-uglify"),
	concat = require("gulp-concat"),
	header = require("gulp-header"),
	buffer = require("vinyl-buffer"),
	pkg = require("./package.json"),
	debug = require("gulp-debug"),
	eslint = require("gulp-eslint"),
	browserify = require("browserify"),
	source = require("vinyl-source-stream"),
	rename = require("gulp-rename");

var banner = ["/**",
	" * <%= pkg.name %> v<%= pkg.version %>",
	" * Copyright <%= pkg.company %>",
	" * @link <%= pkg.homepage %>",
	" * @license <%= pkg.license %>",
	" */",
	""].join("\n");

gulp.task("lint", function() {
	return gulp.src("./src/js/**/*.js")
		.pipe(debug())
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

function taskBrowserify(opts) {
	return browserify("./src/js/spell-checker.js", opts)
		.bundle();
}

gulp.task("browserify:debug", gulp.series("lint", function() {
	return taskBrowserify({debug:true, standalone:"CodeMirrorSpellChecker"})
		.pipe(source("spell-checker.debug.js"))
		.pipe(buffer())
		.pipe(header(banner, {pkg: pkg}))
		.pipe(gulp.dest("./debug/"));
}));

gulp.task("browserify", gulp.series("lint", function() {
	return taskBrowserify({standalone:"CodeMirrorSpellChecker"})
		.pipe(source("spell-checker.js"))
		.pipe(buffer())
		.pipe(header(banner, {pkg: pkg}))
		.pipe(gulp.dest("./debug/"));
}));

gulp.task("scripts", gulp.series("browserify:debug", "browserify", "lint", function() {
	var js_files = ["./debug/spell-checker.js"];
	
	return gulp.src(js_files)
		.pipe(concat("spell-checker.min.js"))
		.pipe(uglify())
		.pipe(buffer())
		.pipe(header(banner, {pkg: pkg}))
		.pipe(gulp.dest("./dist/"));
}));

gulp.task("styles", function() {
	var css_files = [
		"./src/css/*.css",
	];
	
	return gulp.src(css_files)
		.pipe(concat("spell-checker.css"))
		.pipe(buffer())
		.pipe(header(banner, {pkg: pkg}))
		.pipe(gulp.dest("./debug/"))
		.pipe(minifycss())
		.pipe(rename("spell-checker.min.css"))
		.pipe(buffer())
		.pipe(header(banner, {pkg: pkg}))
		.pipe(gulp.dest("./dist/"));
});

gulp.task("default", gulp.series("scripts", "styles"));