/**
 * tasks/pipeline.js
 *
 * The order in which your CSS, JavaScript, and client-side template files
 * injected as <script> or <link> tags.
 *
 * > If you are not relying on automatic asset linking, then you can safely ignore this file.
 *
 * For more information see:
 *   https://sailsjs.com/anatomy/tasks/pipeline.js
 */



//  ██████╗ ██╗      █████╗ ██╗███╗   ██╗        ██████╗███████╗███████╗
//  ██╔══██╗██║     ██╔══██╗██║████╗  ██║       ██╔════╝██╔════╝██╔════╝
//  ██████╔╝██║     ███████║██║██╔██╗ ██║       ██║     ███████╗███████╗
//  ██╔═══╝ ██║     ██╔══██║██║██║╚██╗██║       ██║     ╚════██║╚════██║
//  ██║     ███████╗██║  ██║██║██║ ╚████║    ██╗╚██████╗███████║███████║
//  ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝    ╚═╝ ╚═════╝╚══════╝╚══════╝
//
//  ███████╗██╗██╗     ███████╗███████╗
//  ██╔════╝██║██║     ██╔════╝██╔════╝
//  █████╗  ██║██║     █████╗  ███████╗
//  ██╔══╝  ██║██║     ██╔══╝  ╚════██║
//  ██║     ██║███████╗███████╗███████║
//  ╚═╝     ╚═╝╚══════╝╚══════╝╚══════╝
//
// CSS files to inject as <link> tags, in order.
//
// > Note: if you're using built-in LESS support with default settings,
// > you'll want to change `assets/styles/importer.less` instead.
//
var cssFilesToInject_Backend = [

  // Bring in `.css` files for themes and style guides (e.g. Bootstrap, Foundation)
  // 'dependencies/**/*.css',

  // All of the rest of your custom `.css` files will be injected here,
  // in no particular order.  To customize the ordering, add additional
  // items here, _above_ this one.
  //'styles/**/*.css'
  'vendors/mdi/css/materialdesignicons.min.css',
  'vendors/css/vendor.bundle.base.css',
  'vendors/datatables.net-bs4/dataTables.bootstrap4.css',
  'styles/backend/style.css',
  'styles/backend/custom.css'
];

var cssFilesToInject = [

  // Bring in `.css` files for themes and style guides (e.g. Bootstrap, Foundation)
  // 'dependencies/**/*.css',

  // All of the rest of your custom `.css` files will be injected here,
  // in no particular order.  To customize the ordering, add additional
  // items here, _above_ this one.
  //'styles/**/*.css'

  //'global/css/bootstrap.min.css',
  //'global/css/bootstrap-extend.min.css',
  //'global/fonts/material-design/material-design.min.css',
  //'global/fonts/brand-icons/brand-icons.min.css',

  //'styles/backend/site.css',
  //'styles/backend/custom.css'
];

//   ██████╗██╗     ██╗███████╗███╗   ██╗████████╗   ███████╗██╗██████╗ ███████╗
//  ██╔════╝██║     ██║██╔════╝████╗  ██║╚══██╔══╝   ██╔════╝██║██╔══██╗██╔════╝
//  ██║     ██║     ██║█████╗  ██╔██╗ ██║   ██║█████╗███████╗██║██║  ██║█████╗
//  ██║     ██║     ██║██╔══╝  ██║╚██╗██║   ██║╚════╝╚════██║██║██║  ██║██╔══╝
//  ╚██████╗███████╗██║███████╗██║ ╚████║   ██║      ███████║██║██████╔╝███████╗
//   ╚═════╝╚══════╝╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝      ╚══════╝╚═╝╚═════╝ ╚══════╝
//
//          ██╗███████╗    ███████╗██╗██╗     ███████╗███████╗
//          ██║██╔════╝    ██╔════╝██║██║     ██╔════╝██╔════╝
//          ██║███████╗    █████╗  ██║██║     █████╗  ███████╗
//     ██   ██║╚════██║    ██╔══╝  ██║██║     ██╔══╝  ╚════██║
//  ██╗╚█████╔╝███████║    ██║     ██║███████╗███████╗███████║
//  ╚═╝ ╚════╝ ╚══════╝    ╚═╝     ╚═╝╚══════╝╚══════╝╚══════╝
//
// Client-side javascript files to inject as <script> tags, in order.
//
var jsFilesToInject_Backend = [

  // Load `sails.io` before everything else.
  'dependencies/lodash.js',
  'dependencies/moment.js',
  'dependencies/cloud.js',
  'vendors/jquery/jquery-3.4.1.min.js',
  'vendors/popper/popper.min.js',
  'vendors/bootstrap/bootstrap.min.js',
  'vendors/datatables.net/jquery.dataTables.js',
  'vendors/datatables.net-bs4/dataTables.bootstrap4.js',
  'vendors/asscrollbar/jquery-asScrollbar.js',
  'vendors/asscrollable/jquery-asScrollable.js',
  'vendors/ashoverscroll/jquery-asHoverScroll.js',
  'vendors/validate/validator.min.js',
  // First amongst the app-level files, bring in cloud configuration
  'js/backend/cloud.setup.js',
  'js/backend/base.js',

  // All of the rest of your custom client-side js files will be injected here,
  // in no particular order.  To customize the ordering, add additional items
  // here, _above_ this one.
  // 'js/backend/**/*.js'
];

var jsFilesToInject = [

  // Load `sails.io` before everything else.
  'dependencies/sails.io.js',
  'dependencies/lodash.js',
  'dependencies/moment.js',
  'dependencies/cloud.js',

  // Bring in components & utilities before bringing in the rest (i.e. page scripts)
  'js/components/**/*.js',

  // All of the rest of your custom client-side js files will be injected here,
  // in no particular order.  To customize the ordering, add additional items
  // here, _above_ this one.
  // 'js/backend/**/*.js'

  'js/frontend/cloud.setup.js',
  //'js/frontend/main.js',
];


//   ██████╗██╗     ██╗███████╗███╗   ██╗████████╗   ███████╗██╗██████╗ ███████╗
//  ██╔════╝██║     ██║██╔════╝████╗  ██║╚══██╔══╝   ██╔════╝██║██╔══██╗██╔════╝
//  ██║     ██║     ██║█████╗  ██╔██╗ ██║   ██║█████╗███████╗██║██║  ██║█████╗
//  ██║     ██║     ██║██╔══╝  ██║╚██╗██║   ██║╚════╝╚════██║██║██║  ██║██╔══╝
//  ╚██████╗███████╗██║███████╗██║ ╚████║   ██║      ███████║██║██████╔╝███████╗
//   ╚═════╝╚══════╝╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝      ╚══════╝╚═╝╚═════╝ ╚══════╝
//
//  ████████╗███████╗███╗   ███╗██████╗ ██╗      █████╗ ████████╗███████╗███████╗
//  ╚══██╔══╝██╔════╝████╗ ████║██╔══██╗██║     ██╔══██╗╚══██╔══╝██╔════╝██╔════╝
//     ██║   █████╗  ██╔████╔██║██████╔╝██║     ███████║   ██║   █████╗  ███████╗
//     ██║   ██╔══╝  ██║╚██╔╝██║██╔═══╝ ██║     ██╔══██║   ██║   ██╔══╝  ╚════██║
//     ██║   ███████╗██║ ╚═╝ ██║██║     ███████╗██║  ██║   ██║   ███████╗███████║
//     ╚═╝   ╚══════╝╚═╝     ╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚══════╝
//
// Client-side HTML templates to precompile and inject as a single <script> tag.
// (The ordering of this array shouldn't matter.)
//
// > By default, Sails uses JST (~=lodash/underscore) templates and precompiles
// > them into functions for you.  If you want to use handlebars, pug, dust, etc.,
// > with the asset linker, no problem-- you'll just want to make sure the precompiled
// > templates get spit out to the same file.  For information on customizing and
// > installing your own Grunt tasks or using a different build pipeline, be sure
// > to check out:
// >   https://sailsjs.com/docs/concepts/assets/task-automation
//
var templateFilesToInject_Backend = [
  'templates/**/*.html'
];



//  ███╗   ███╗██╗███████╗ ██████╗       ███████╗███████╗████████╗██╗   ██╗██████╗
//  ████╗ ████║██║██╔════╝██╔════╝       ██╔════╝██╔════╝╚══██╔══╝██║   ██║██╔══██╗
//  ██╔████╔██║██║███████╗██║            ███████╗█████╗     ██║   ██║   ██║██████╔╝
//  ██║╚██╔╝██║██║╚════██║██║            ╚════██║██╔══╝     ██║   ██║   ██║██╔═══╝
//  ██║ ╚═╝ ██║██║███████║╚██████╗██╗    ███████║███████╗   ██║   ╚██████╔╝██║
//  ╚═╝     ╚═╝╚═╝╚══════╝ ╚═════╝╚═╝    ╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝
//
// The following code exists to parse the arrays of glob expressions above, and
// then expose them via `module.exports`.  **You should not need to change any of
// the code below, unless you are modifying the default asset pipeline.**

// Default path for public folder (see documentation on sailsjs.com for more information)
var tmpPath = '.tmp/public/';

// Prefix relative paths to source files so they point to the proper locations
// (i.e. where the other Grunt tasks spit them out, or in some cases, where
// they reside in the first place)
module.exports.cssFilesToInject_Backend = cssFilesToInject_Backend.map((cssPath) => {
  // If we're ignoring the file, make sure the ! is at the beginning of the path
  if (cssPath[0] === '!') {
    return require('path').join('!' + tmpPath, cssPath.substr(1));
  }
  return require('path').join(tmpPath, cssPath);
});
module.exports.jsFilesToInject_Backend = jsFilesToInject_Backend.map((jsPath) => {
  // If we're ignoring the file, make sure the ! is at the beginning of the path
  if (jsPath[0] === '!') {
    return require('path').join('!' + tmpPath, jsPath.substr(1));
  }
  return require('path').join(tmpPath, jsPath);
});
module.exports.templateFilesToInject_Backend = templateFilesToInject_Backend.map((tplPath) => {
  // If we're ignoring the file, make sure the ! is at the beginning of the path
  if (tplPath[0] === '!') {
    return require('path').join('!assets/', tplPath.substr(1));
  }
  return require('path').join('assets/', tplPath);
});

//----------------------------- FRONTEND ------------------------------------
module.exports.cssFilesToInject = cssFilesToInject.map((cssPath) => {
  // If we're ignoring the file, make sure the ! is at the beginning of the path
  if (cssPath[0] === '!') {
    return require('path').join('!' + tmpPath, cssPath.substr(1));
  }
  return require('path').join(tmpPath, cssPath);
});
module.exports.jsFilesToInject = jsFilesToInject.map((jsPath) => {
  // If we're ignoring the file, make sure the ! is at the beginning of the path
  if (jsPath[0] === '!') {
    return require('path').join('!' + tmpPath, jsPath.substr(1));
  }
  return require('path').join(tmpPath, jsPath);
});