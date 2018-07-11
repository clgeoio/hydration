import gulp from 'gulp';
import {spawn} from 'child_process';
import hugoBin from 'hugo-bin';
import BrowserSync from 'browser-sync';
import runSequence from 'run-sequence';
import critical from 'critical';
import postcss from 'gulp-postcss';
import cssImport from 'postcss-import';
import cssnext from 'postcss-cssnext';
import cssclean from 'postcss-clean';
import swPrecache from 'sw-precache';
import htmlmin from 'gulp-htmlmin';

const browserSync = BrowserSync.create();
const outputDirectory = 'dist';
const hugoArgsDefault = ['-d', `../${outputDirectory}`, '-s', 'site', '-v'];

gulp.task('server', (cb) => {
    runSequence('hugo', 
        ['bundle-minify-css', 'minify-html', 'bundle-minify-js'],
        ['critical', 'generate-service-worker'], 
        'run-server',
      cb);
});

gulp.task('hugo', (cb) => buildSite(cb));
gulp.task('run-server', (cb) => {
  runServer(cb)
});

gulp.task('bundle-minify-css', () => (
  gulp.src('./src/css/main.css')
    .pipe(postcss([cssImport(), cssnext(), cssclean()]))
    .pipe(gulp.dest(`${outputDirectory}/css`))
    .pipe(browserSync.stream())
));

gulp.task('bundle-minify-js', () => {
  gulp.src('./src/js/**/*.js')
    .pipe(gulp.dest(`${outputDirectory}/js`));
})

gulp.task('minify-html', () =>{
  return gulp.src(`${outputDirectory}/**/*.html`)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(outputDirectory));
});


gulp.task('critical', () => {
  return gulp.src(`${outputDirectory}/index.html`)
    .pipe(critical.stream({
      inline:   true, 
      base:     outputDirectory,
      minify:   true,
      width:    1280,
      height:   800,
      ignore:   ['@font-face']
    }))
    .pipe(gulp.dest(outputDirectory));
});

gulp.task('generate-service-worker', (callback) => {
    swPrecache.write(`${outputDirectory}/sw.js`, {
      staticFileGlobs: [outputDirectory + '/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}'],
      stripPrefix: outputDirectory
    }, callback);
  });

//Server up site w/ browsersync
  function runServer() {
    browserSync.init({
      server: {
        baseDir: `./${outputDirectory}`
      }
    });
    //gulp.watch('./src/js/**/*.js', ['js']);
    gulp.watch('./src/css/main.css', ['compile-css']);
    //gulp.watch('./src/fonts/**/*', ['fonts']);
    //gulp.watch('./site/**/*', ['hugo']);
  };
  
//Build site
function buildSite(cb, options, environment = 'development') {
    const args = options ? hugoArgsDefault.concat(options) : hugoArgsDefault;
  
    process.env.NODE_ENV = environment;
  
    return spawn(hugoBin, args, {stdio: 'inherit'}).on('close', (code) => {
      if (code === 0) {
        browserSync.reload();
        cb();
      } else {
        browserSync.notify('Hugo build failed :(');
        cb('Hugo build failed');
      }
    });
  }