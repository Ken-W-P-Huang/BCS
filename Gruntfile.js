/**
 * Created by kenhuang on 2018/10/23.
 */
module.exports = function (grunt) {
    grunt.initConfig({
        /* 'build/libs/exploded/<%= pkg.warName %>/WEB-INF/html' */
        pkg: grunt.file.readJSON('package.json'),
        frontend:'src/main/frontend',
        tmp:'build/tmp',
        webapp:'src/main/webapp/WEB-INF',
        jslib:'<%= webapp %>/js/lib',
        csslib:'<%= webapp %>/css/lib',
        banner:'/*!<%= pkg.name %> - <%= pkg.version %>-<%=grunt.template.today("yyyy-mm-dd") %> */\n',
/***********************************************************************************************************************
 * 公共部分
 **********************************************************************************************************************/
/*包含*/
        includes: {
            jspatch:{
                //将polyfill合并成IE*.js
                options: {
                    flatten: true,
                    includePath: '<%= frontend %>/js/lib',
                    includeRegexp: /^\s*\/\/\s*import\s+['"]?([^'"]+\.js)['"]?\s*$/
                },
                cwd: '<%= frontend %>/js/patch',
                src: ['**/*.js'],
                dest: '<%= jslib %>'
            }
        },
/*css/js内容合并*/
        concat: {
            bcsjs:{
                //合并BCS的相关js文件
                options: {
                    stripBanners: true,
                    separator: ';\n',
                    // banner: '<%= banner %>',
                    process: function(src, filepath) {
                        return '// Source: ' + filepath + '\n' +
                            src.replace(/(^|\n)[ \t]*?import.*?from[ \t]*?['"].*?['"].*?/g, '\n');
                    },
                },
                src:['<%= frontend %>/js/bcs/model/Browser.js',
                    '<%= frontend %>/js/bcs/**/*.js'],
                dest:'<%= tmp %>/js/BCS.js'
            },
            css:{
                options: {
                    stripBanners: true,
                    separator: '\n',
                    banner: '<%= banner %>',
                },
                src:['<%= frontend %>/css/*.css',
                    // '!<%= frontend %>/css/mediaelementplayer.css',
                    // '!<%= frontend %>/css/normalize.css'
                ],
                dest:'<%= csslib %>/patch.css'
            },
        },
/***********************************************************************************************************************
 * js
 **********************************************************************************************************************/
/*语法检查*/
// http://jshint.com/docs
/* jshint ignore:start */
// Code here will be ignored by JSHint.
/* jshint ignore:end */
        jshint: {
            options: {
                "maxerr": 50,           // {int} Maximum error before stopping
                // Enforcing
                "bitwise": false,        //Prohibit bitwise operators (&, |, ^, etc.)
                "camelcase": false,     //Identifiers must be in camelCase
                "curly": true,          //Require {} for every new block or scope
                "eqeqeq": true,         //Require triple equals (===) for comparison
                "forin": true,          //Require filtering for in loops with obj.hasOwnProperty()
                "freeze": false,        //prohibits overwriting prototypes of native objects
                "immed": false,         //Require immediate invocations to be wrapped in parens
                "latedef": false,       //Require variables/functions to be defined before being used
                "newcap": false,        //Require capitalization of all constructor functions
                "noarg": true,          //Prohibit use of `arguments.caller` and `arguments.callee`
                "noempty": true,        //Prohibit use of empty block福龙开发区英明路13号s
                "nonbsp": true,         //Prohibit "non-breaking whitespace" characters.
                "nonew": false,         //Prohibit use of constructors for side-effects
                "plusplus": false,      //Prohibit use of `++` and `--`
                "quotmark": false,
                "undef": true,          //Require all non-global variables to be declared
                "unused": false,
                "strict": false,        //Requires all functions run in ES5 Strict Mode
                "maxparams": false,     // {int} Max number of formal params allowed per function
                "maxdepth": false,      // {int} Max depth of nested blocks (within functions)
                "maxstatements": false, // {int} Max number statements per function
                "maxcomplexity": false, // {int} Max cyclomatic complexity per function
                "maxlen": false,        // {int} Max number of characters per line
                "varstmt": false,

                // Relaxing
                "asi": true,            //Tolerate Automatic Semicolon Insertion (no semicolons)
                "boss": false,          //Tolerate assignments where comparisons would be expected
                "debug": false,         //Allow debugger statements e.g. browser breakpoints.
                "eqnull": false,        //Tolerate use of `== null`
                "esversion": 6,
                "moz": false,           //Allow Mozilla specific syntax
                "evil": false,          //Tolerate use of `eval` and `new Function()`
                "expr": true,          //Tolerate `ExpressionStatement` as Programs
                "funcscope": false,     //Tolerate defining variables inside control statements
                "globalstrict": false,  //Allow global "use strict" (also enables 'strict')
                "iterator": false,      //Tolerate using the `__iterator__` property
                "lastsemic": false,
                "laxbreak": true,      //Tolerate possibly unsafe line breakings
                "laxcomma": false,      //Tolerate comma-first style coding
                "loopfunc": true,      //Tolerate functions being defined in loops
                "multistr": false,      //Tolerate multi-line strings
                "noyield": false,       //Tolerate generator functions with no yield statement
                "notypeof": false,      //Tolerate invalid typeof operator values
                "proto": false,         //Tolerate using the `__proto__` property
                "scripturl": false,     //Tolerate script-targeted URLs
                "shadow": false,        //Allows re-define variables later in code
                "sub": false,
                "supernew": false,      //Tolerate `new function () { ... };` and `new Object;`
                "validthis": false,     //Tolerate using this in a non-constructor function

                // Environments
                "browser": true,        // Web Browser (window, document, etc)
                "browserify": false,    // Browserify (node.js code in the browser)
                "couch": false,         // CouchDB
                "devel": true,          // Development/debugging (alert, confirm, etc)
                "dojo": false,          // Dojo Toolkit
                "jasmine": false,       // Jasmine
                "jquery": true,         // jQuery
                "mocha": true,          // Mocha
                "mootools": false,      // MooTools
                "node": false,          // Node.js
                "nonstandard": false,   // Widely adopted globals (escape, unescape, etc)
                "phantom": false,       // PhantomJS
                "prototypejs": false,   // Prototype and Scriptaculous
                "qunit": false,         // QUnit
                "rhino": false,         // Rhino
                "shelljs": false,       // ShellJS
                "typed": false,         // Globals for typed array constructions
                "worker": false,        // Web Workers
                "wsh": false,           // Windows Scripting Host
                "yui": false,           // Yahoo User Interface

                // Custom Globals
                "globals": {
                    "jQuery": true,
                    "console": true,
                    "module": true
                },
                ignores:['']
            },
            build: ['<%= frontend %>/js/bcs/**/*.js']
        },
// js 将ES6代码转为ES5代码
// babel-plugin-transform-es3-member-expression-literals
// babel-plugin-transform-es3-property-literals
// @babel/preset-react
        babel: {
            options: {
                sourceMap: false,
                presets: ["es2015"],
                plugins: [
                    ["babel-plugin-transform-runtime", {
                        "helpers": false,
                        "polyfill": false,
                        "regenerator": false,
                        "moduleName": "babel-runtime"
                    }],
                    ["babel-plugin-transform-es3-property-literals"],
                    ["babel-plugin-transform-es3-member-expression-literals"],
                    ['babel-plugin-transform-es2015-modules-umd', { "loose": true }],
                ]
            },
            dist: {
                files: {
                    // '<%= frontend %>/js/dist/BCS.js': ['<%= concat.BCSConcat.dest %>']
                    '<%= jslib %>/FormData.es5.js': ['<%= frontend %>/js/lib/FormData.js'],
                    '<%= jslib %>/sendbeacon.es5.js': ['<%= frontend %>/js/lib/sendbeacon.js'],
                    '<%= jslib %>/BCS.js': ['<%= concat.bcsjs.dest %>']
                    // '<%= frontend %>/js/lib/dialog-polyfill.es5.js': ['<%= frontend %>/js/lib/dialog-polyfill.js'],
                }
            }
        },
/*压缩*/
        uglify: {
            options: {
                stripBanners: true,
                mangle: {},
                ie8: true,
                banner: '<%= banner %>'
            },
            bcsjs: {
                files: [{
                    expand: true,
                    cwd: '<%= jslib %>',
                    src: ['BCS.js'],
                    dest: '<%= webapp %>/js'
                }]
            },
            jspatch:{
                files: [{
                    expand: true,
                    cwd: '<%= jslib %>',
                    src: ['**/IE*.js'],
                    dest: '<%= webapp %>/js'
                }]
            }

        },
/***********************************************************************************************************************
 * css
 **********************************************************************************************************************/
/*https://github.com/CSSLint/csslint/wiki/Rules*/
        csslint:{
            options:{
                "box-model": false,
                "adjoining-classes": false,
                "box-sizing": false,
                "compatible-vendor-prefixes": false,
                "gradients": false,
                "text-indent": false,
                "fallback-colors": false,
                "star-property-hack": false,
                "underscore-property-hack": false,
                "bulletproof-font-face": false,
                "font-faces": false,
                "import": false,
                "regex-selectors": false,
                "universal-selector": false,
                "unqualified-attributes": false,
                "overqualified-elements": false,
                "duplicate-background-images": false,
                "floats": false,
                "font-sizes": false,
                "ids": false,
                "important": false,
                "outline-none": false,
                "qualified-headings": false,
                "unique-headings": false,
                "order-alphabetical":false,
                "known-properties":false,
                "empty-rules":false,
                "display-property-grouping":false

            },
            build:['<%= csslib %>/patch.css']

        },
 //压缩css
        cssmin:{
            options:{
                stripBanners:true, //合并时允许输出头部信息
                banner:'<%= banner %>'
            },
            build:{
                src:'<%= csslib %>/patch.css',//压缩是要压缩合并了的
                dest:'<%= webapp %>/css/patch.min.css' //dest 是目的地输出
            }
        },
/***********************************************************************************************************************
 * 复制swf
 **********************************************************************************************************************/
        copy: {
            swf: {
                files: [
                    // includes files within path
                    {expand: true,
                        cwd: '<%= frontend %>/swf/',
                        src: ['**/*.swf'],
                        dest: '<%= webapp %>/swf/',
                        filter: 'isFile'},
                ]
            },
            htc:{
                files: [
                    // includes files within path
                    {expand: true,
                        cwd: '<%= frontend %>/js/lib/',
                        src: ['**/*.htc'],
                        dest: '<%= webapp %>/htc/',
                        filter: 'isFile'}
                ]
            }
        },
/***********************************************************************************************************************
 * git
 **********************************************************************************************************************/
        gitadd: {
            bcs: {
                options: {
                    force: false
                },
                files: {
                    src: ['**.*']
                }
            }
        },
        gitcommit: {
            bcs: {
                options: {
                    message: 'Add'
                },
                files: {
                    src: ['**.*']
                }
            }
        },
        // gitremote: {
        //     bcs: {
        //         options: {
        //             add: { name: 'origin', url: 'https://github.com/Ken-W-P-Huang/BC-S.git' }
        //         }
        //     }
        // },
        gitpush: {
            bcs: {
                options: {
                    remote:'origin',
                    branch:'master'
                }
            }
        },
/***********************************************************************************************************************
 * watch
 **********************************************************************************************************************/
        watch: {
            js:{
                files: ['<%= frontend %>/js/bcs/**/*.js'],
                tasks: ['concat:bcsjs','jshint','babel','uglify:bcsjs'],
                options: {
                    livereload: true,
                    atBegin:true
                }
            },
            // jspatch:{
            //     files: ['<%= frontend %>/js/patch/**/*.js'],
            //         tasks: ['includes:jspatch','uglify:jspatch'],
            //         options: {
            //         livereload: true,
            //             atBegin:true
            //     }
            // },
            // css:{
            //     files: ['<%= frontend %>/css/**/*.css'],
            //     tasks: ['concat:css','csslint','cssmin'],
            //     options: {
            //         livereload: true,
            //         atBegin:true
            //     }
            // },
            // htc:{
            //     files: ['<%= frontend %>/js/bcs/lib/**/*.htc'],
            //     tasks: ['copy:htc'],
            //     options: {
            //         livereload: true,
            //         atBegin:true
            //     }
            // },
            // swf:{
            //     files:['<%= frontend %>/swf/**/*.swf'],
            //     tasks: ['copy:swf'],
            //     options: {
            //         livereload: true,
            //         atBegin:true
            //     }
            // }
        }
    })
    grunt.loadNpmTasks('grunt-includes')
    grunt.loadNpmTasks('grunt-contrib-jshint')
    grunt.loadNpmTasks('grunt-contrib-concat')
    grunt.loadNpmTasks('grunt-babel')
    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-contrib-watch')
    grunt.loadNpmTasks('grunt-contrib-copy')
    grunt.loadNpmTasks('grunt-contrib-csslint')
    grunt.loadNpmTasks('grunt-contrib-cssmin')
    grunt.loadNpmTasks('grunt-git')
    grunt.registerInitTask('default',
        ['includes','babel','jshint','concat','uglify','watch','copy','git'])
    grunt.registerTask('push',['gitadd','gitcommit','gitpush'])
};
