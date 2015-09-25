var gulp = require('gulp'),
  electron = require('gulp-electron'),
  clean = require('gulp-clean');;
var packageJson = require('./src/package.json');

gulp.task('electron', function() {

    gulp.src("")
    .pipe(electron({
        src: './src',
        packageJson: packageJson,
        release: './release',
        cache: './cache',
        version: 'v0.33.1',
        packaging: true,
        platforms: ['win32-ia32'],
        asar: false,
        platformResources: {
            darwin: {
                CFBundleDisplayName: packageJson.name,
                CFBundleIdentifier: packageJson.name,
                CFBundleName: packageJson.name,
                CFBundleVersion: packageJson.version
            },
            win: {
                "version-string": packageJson.version,
                "file-version": packageJson.version,
                "product-version": packageJson.version
            }
        }
    }))
    .pipe(gulp.dest(""));
});

gulp.task('clean', function () {
  return gulp.src('./release', {read: false})
    .pipe(clean({force: true}));
});

gulp.task('default', ['clean', 'electron'], function () {
  console.info('build success');
})
