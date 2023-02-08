
// Initizlise modules
const {src, dest, watch, series, parallel} = require('gulp');
const gulpif = require('gulp-if');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

// File paths variables
const files = {
	scssPath: './src/scss/**/*.scss'
};

const jsFolder = "./src/js/";
const jsFiles = ["app.js"];

// Sass tasks
let sassTask = () => {
	return src(files.scssPath)
		.pipe(gulpif(process.env.NODE_ENV == "development", sourcemaps.init()))
		.pipe(sass().on('error', sass.logError))
		.pipe(gulpif(process.env.NODE_ENV == "production", postcss([ autoprefixer('since 2015-03-10'), cssnano() ])))
		.pipe(gulpif(process.env.NODE_ENV == "development", sourcemaps.write('.')))
		.pipe(dest('./public/css'));
}

// JavaScript tasks
let jsTask = (cb) => {
	jsFiles.map((entry) => {
		return (
			browserify({ entries: [jsFolder + entry] })
			.transform(babelify, { presets: ['@babel/preset-env'] })
			.bundle()
			.pipe(source(entry))
			.pipe(buffer())
			.pipe(gulpif(process.env.NODE_ENV == "development", sourcemaps.init({ loadMaps: true })))
			.pipe(gulpif(process.env.NODE_ENV == "production", uglify()))
			.pipe(gulpif(process.env.NODE_ENV == "development", sourcemaps.write('./')))
			.pipe(dest('./public/js'))
		);
	});
	cb();
}

// Watch task
let watchTask = () => {
	watch([files.scssPath, './src/js/*'],
		parallel(sassTask, jsTask));
}

exports.build = series(sassTask, jsTask);

exports.watch = series(
	parallel(sassTask, jsTask),
	watchTask
);
