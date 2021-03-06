// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

      .run(function ($ionicPlatform) {
            ionic.Platform.fullScreen();
            $ionicPlatform.ready(function () {
                  inicializacao();

                  if (window.cordova && window.cordova.plugins.Keyboard) {
                        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                        // for form inputs)
                        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

                        // Don't remove this line unless you know what you are doing. It stops the viewport
                        // from snapping when text inputs are focused. Ionic handles this internally for
                        // a much nicer keyboard experience.
                        cordova.plugins.Keyboard.disableScroll(true);
                  }
                  if (window.StatusBar) {
                        //StatusBar.styleDefault();
                        StatusBar.hide();
                  }
            });
      })



function inicializacao() {
      var admobid = {};
      var debugmode = false;
      var states = Object.freeze({
            SplashScreen: 0,
            GameScreen: 1,
            ScoreScreen: 2
      });

      var pause = false;
      var contadorDeMorte = 0;
      var cont = 0;
      var cont2 = 0;
      var flag = true;
      var updaterate = 1;
      var levelFase = 2000;
      var jumping = 1;
      var currentstate;
      var gravity = 0.25;
      var velocity = 0;

      var rotation = 0;
      var jump = -10;

      //variaveis de controle
      var documento = $(document);
      var player = $("#player");
      //var pipe = $(".pipe");
      var animated = $(".animated");
      var splash = $("#splash");
      var boundingbox = $(".boundingbox");
      var playPause = $("#playPause");
      var land = $("#land");
      var sky = $("#sky");
      var ceiling = $("#ceiling");
      var replay = $("#replay");
      var gamescreen = $("#gamescreen");
      var flyareatag = $("#flyarea");
      var flyArea = flyareatag.height();
      var bigscore = $("#bigscore");
      var currentscore = $("#currentscore");
      var highscoretag = $("#highscore");
      var medaltag = $("#medal");
      var scoreboardtag = $("#scoreboard");
      var propaganda = $("#propaganda");
      var playerbox = $("#playerbox");
      var pipebox = $("#pipebox");

      var posicaoInicial = (flyArea - player.height());
      var position = posicaoInicial;

      var score = 0;
      var highscore = 0;

      var pipeheight = 90;
      var pipewidth = 52;
      var pipes = new Array();

      var replayclickable = false;

      //sounds
      var volume = 30;
      var soundJump = new buzz.sound("assets/sounds/sfx_wing.ogg");
      var soundScore = new buzz.sound("assets/sounds/sfx_point.ogg");
      var soundHit = new buzz.sound("assets/sounds/sfx_hit.ogg");
      var soundDie = new buzz.sound("assets/sounds/sfx_die.ogg");
      var soundSwoosh = new buzz.sound("assets/sounds/sfx_swooshing.ogg");
      buzz.all().setVolume(volume);



      //loops
      var loopGameloop;
      var loopPipeloop;

      documento.ready(function () {
            if (window.location.search == "?debug")
                  debugmode = true;
            if (window.location.search == "?easy")
                  pipeheight = 200;

            //get the highscore
            var savedscore = getCookie("highscore");
            if (savedscore != "")
                  highscore = parseInt(savedscore);
            //start with the splash screen
            showSplash();
      });

      function getCookie(cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                  var c = ca[i].trim();
                  if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
            }
            return "";
      }

      function setCookie(cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toGMTString();
            document.cookie = cname + "=" + cvalue + "; " + expires;
      }

      function showSplash() {
            currentstate = states.SplashScreen;
            flag = true;

            //set the defaults (again)
            velocity = 0;
            position = posicaoInicial;
            rotation = 0;
            score = 0;

            //update the player in preparation for the next game
            player.css({ y: 0, x: 0 });
            updatePlayer(player);

            soundSwoosh.stop();
            soundSwoosh.play();

            //clear out all the pipes if there are any
            $(".pipe").remove();
            pipes = new Array();

            //make everything animated again
            $(".animated").css('animation-play-state', 'running');
            $(".animated").css('-webkit-animation-play-state', 'running');

            //fade in the splash
            splash.transition({ opacity: 1 }, 2000, 'ease');
      }

      function startGame() {
            currentstate = states.GameScreen;

            //fade out the splash
            splash.stop();
            splash.transition({ opacity: 0 }, 500, 'ease');

            //update the big score
            setBigScore();
            setPlayPause();
            //debug mode?
            if (debugmode) {
                  //show the bounding boxes
                  boundingbox.show();
            }
            updatePipes();
            enterFrame();
            playerJump();
      }

      function enterFrame() {
            cont++;
            cont2++;
            if (cont == updaterate) {
                  gameloop();
                  cont = 0;
            }

            if (cont2 == parseInt(levelFase / 20)) {
                  //if (cont2 == (levelFase / 20)) {
                  //console.log(cont2 + " " + parseInt((levelFase) / 20));
                  updatePipes();
                  cont2 = 0
            }
            if (flag) {
                  requestAnimationFrame(enterFrame);
            }
      }

      function setPlayPause(erase) {

            playPause.empty();

            if (erase)
                  return;

            playPause.append("<img src='assets/playPause.png'>");
      }

      playPause.click(function () {
            //console.log(pause);
            if (!pause) {
                  $(".animated").css('animation-play-state', 'paused');
                  $(".animated").css('-webkit-animation-play-state', 'paused');
                  gamescreen.css("pointer-events", "none");
                  flag = false;
                  pause = true;
            } else {
                  $(".animated").css('animation-play-state', 'running');
                  $(".animated").css('-webkit-animation-play-state', 'running');
                  gamescreen.css("pointer-events", "auto");
                  flag = true;
                  pause = false;
                  enterFrame();
            }
            //console.log(jumping);
            //alert(jumping)
      })

      function aumentarLevel() {
            levelFase -= 20;
            cont = 0;
            cont2 = 0
      }

      function updatePlayer(player) {
            //rotation
            rotation = Math.min((velocity / 10) * 90, 90);

            //apply rotation and position
            $(player).css({ rotate: 0, top: position });
      }

      function gameloop() {

            //update the player speed/position
            velocity += gravity;
            position += velocity;

            //update the player
            updatePlayer(player);

            //create the bounding box
            var box = document.getElementById('player').getBoundingClientRect();
            var origwidth = 34.0;
            var origheight = 24.0;

            var boxwidth = origwidth - (Math.sin(Math.abs(rotation) / 90) * 8);
            var boxheight = (origheight + box.height) / 2;
            var boxleft = ((box.width - boxwidth) / 2) + box.left;
            var boxtop = ((box.height - boxheight) / 2) + box.top;
            var boxright = boxleft + boxwidth;
            var boxbottom = boxtop + boxheight;

            //if we're in debug mode, draw the bounding box
            if (debugmode) {
                  var boundingbox = playerbox;
                  boundingbox.css('left', boxleft);
                  boundingbox.css('top', boxtop);
                  boundingbox.css('height', boxheight);
                  boundingbox.css('width', boxwidth);
            }

            //did we hit the ground?

            var piso = (land.offset().top + land.height())
            if (box.bottom >= land.offset().top) {
                  if (jumping == 4) {
                        sky.effect("shake");
                  }
                  velocity = 0;
                  gravity = 0;
                  jumping = 1;
                  position = posicaoInicial;
                  //position = 100
            }

            //have they tried to escape through the ceiling? :o

            if (boxtop <= (ceiling.offset().top + ceiling.height())) {
                  position = 0;
            }

            //we can't go any further without a pipe
            if (pipes[0] == null)
                  return;

            //determine the bounding box of the next pipes inner area
            var nextpipe = pipes[0];
            var nextpipeupper = nextpipe.children(".pipe_upper");

            var pipetop = nextpipeupper.offset().top + nextpipeupper.height();
            var pipeleft = nextpipeupper.offset().left - 2; // for some reason it starts at the inner pipes offset, not the outer pipes.
            var piperight = pipeleft + pipewidth;
            var pipebottom = pipetop + pipeheight;

            if (debugmode) {
                  var boundingbox = pipebox;
                  boundingbox.css('left', pipeleft);
                  boundingbox.css('top', pipetop);
                  boundingbox.css('height', pipeheight);
                  boundingbox.css('width', pipewidth);
            }

            //have we gotten inside the pipe yet?
            if (boxright > pipeleft) {
                  //we're within the pipe, have we passed between upper and lower pipes?
                  if (/*boxtop > pipetop &&*/ boxbottom < pipebottom) {
                        //yeah! we're within bounds

                  }
                  else {
                        //no! we touched the pipe
                        playerDead();
                        return;
                  }
            }

            //have we passed the imminent danger?
            if (boxleft > piperight) {
                  //yes, remove it
                  pipes.splice(0, 1);

                  //and score a point
                  playerScore();
            }
      }

      //Handle space bar
      $(document).keydown(function (e) {
            //space bar!
            if (e.keyCode == 32) {
                  //in ScoreScreen, hitting space should click the "replay" button. else it's just a regular spacebar hit
                  if (currentstate == states.ScoreScreen)
                        replay.click();
                  else
                        screenClick();
            }
      });

      //Handle mouse down OR touch start
      if ("ontouchstart" in window) {
            gamescreen.on("touchstart", screenClick);
      } else {
            gamescreen.on("mousedown", screenClick);
      }

      function screenClick(e) {
            if (currentstate == states.GameScreen) {
                  playerJump();
            }
            else if (currentstate == states.SplashScreen) {
                  startGame();
            }
      }

      function playerJump() {
            if (jumping == 3) {
                  gravity = 3;
            } else if (jumping == 2) {
                  gravity = 0.25;
                  velocity = -5;
            } else if (jumping == 1) {
                  gravity = 0.25;
                  velocity = jump;
            }

            jumping++;
            //play jump sound
            soundJump.stop();
            soundJump.play();
      }

      function setBigScore(erase) {
            var elemscore = bigscore;
            elemscore.empty();

            if (erase)
                  return;

            var digits = score.toString().split('');
            for (var i = 0; i < digits.length; i++)
                  elemscore.append("<img src='assets/font_big_" + digits[i] + ".png' alt='" + digits[i] + "'>");
      }

      function setSmallScore() {
            var elemscore = currentscore;
            elemscore.empty();

            var digits = score.toString().split('');
            for (var i = 0; i < digits.length; i++)
                  elemscore.append("<img src='assets/font_small_" + digits[i] + ".png' alt='" + digits[i] + "'>");
      }

      function setHighScore() {
            var elemscore = highscoretag;
            elemscore.empty();

            var digits = highscore.toString().split('');
            for (var i = 0; i < digits.length; i++)
                  elemscore.append("<img src='assets/font_small_" + digits[i] + ".png' alt='" + digits[i] + "'>");
      }

      function setMedal() {
            var elemmedal = medaltag;
            elemmedal.empty();

            if (score < 10)
                  //signal that no medal has been won
                  return false;

            if (score >= 10)
                  medal = "bronze";
            if (score >= 20)
                  medal = "silver";
            if (score >= 30)
                  medal = "gold";
            if (score >= 40)
                  medal = "platinum";

            elemmedal.append('<img src="assets/medal_' + medal + '.png" alt="' + medal + '">');

            //signal that a medal has been won
            return true;
      }

      function playerDead() {
            flag = false;
            jumping = 1;
            //stop animating everything!
            setPlayPause(true);
            $(".animated").css('animation-play-state', 'paused');
            $(".animated").css('-webkit-animation-play-state', 'paused');

            //drop the bird to the floor
            var playerbottom = player.position().top + player.width(); //we use width because he'll be rotated 90 deg
            var floor = flyArea;
            var movey = Math.max(0, floor - playerbottom);
            player.transition({ y: movey + 'px', rotate: -90 }, 1000, 'easeInOutCubic');

            //it's time to change states. as of now we're considered ScoreScreen to disable left click/flying
            currentstate = states.ScoreScreen;

            cont = 0;
            cont2 = 0;
            levelFase = 2000;

            //mobile browsers don't support buzz bindOnce event
            if (isIncompatible.any()) {
                  //skip right to showing score
                  showScore();
            }
            else {
                  //play the hit sound (then the dead sound) and then show score
                  soundHit.play().bindOnce("ended", function () {
                        soundDie.play().bindOnce("ended", function () {
                              showScore();
                        });
                  });
            }
      }

      function showScore() {
            //unhide us
            scoreboardtag.css("display", "block");

            //remove the big score
            setBigScore(true);
            setPlayPause(true);

            //have they beaten their high score?
            if (score > highscore) {
                  //yeah!
                  highscore = score;
                  //save it!
                  setCookie("highscore", highscore, 999);
            }

            //update the scoreboard
            setSmallScore();
            setHighScore();
            var wonmedal = setMedal();

            //SWOOSH!
            soundSwoosh.stop();
            soundSwoosh.play();

            //show the scoreboard
            scoreboardtag.css({ y: '40px', opacity: 0 }); //move it down so we can slide it up
            replay.css({ y: '40px', opacity: 0 });
            scoreboardtag.transition({ y: '0px', opacity: 1 }, 600, 'ease', function () {
                  //When the animation is done, animate in the replay button and SWOOSH!
                  soundSwoosh.stop();
                  soundSwoosh.play();
                  replay.transition({ y: '0px', opacity: 1 }, 600, 'ease');

                  //also animate in the MEDAL! WOO!
                  if (wonmedal) {
                        medaltag.css({ scale: 2, opacity: 0 });
                        medaltag.transition({ opacity: 1, scale: 1 }, 1200, 'ease');
                  }
            });

            //make the replay button clickable
            replayclickable = true;
      }

      replay.click(function () {
            //make sure we can only click once
            if (!replayclickable)
                  return;
            else
                  replayclickable = false;
            //SWOOSH!
            soundSwoosh.stop();
            soundSwoosh.play();

            //fade out the scoreboard
            scoreboardtag.transition({ y: '-40px', opacity: 0 }, 1000, 'ease', function () {
                  //when that's done, display us back to nothing
                  scoreboardtag.css("display", "none");
                  contadorDeMorte++;
                  //start the game over!
                  if (contadorDeMorte == 5) {
                        if (ionic.Platform.isAndroid()) {
                              mostrarInterstitial();
                        }
                        statusAD();
                  } else {
                        showSplash();
                  }
            });
      });

      function statusAD() {
            showSplash();
            contadorDeMorte = 0;
      }

      function playerScore() {
            score += 1;

            if (score % 10 == 0) {
                  //console.log("aumentarLevel")
                  if (score == 200) {
                        levelFase = 2000;
                  }
                  if (score == 300) {
                        levelFase = 1000;
                  }
                  if (score == 500) {
                        levelFase = 2000;
                  }
                  aumentarLevel();
            }
            if (score % 10 == 0) {
                  if (score != 1) {
                        mostrarBanner();
                  }
            }

            //play score sound
            soundScore.stop();
            soundScore.play();
            setBigScore();
      }

      function updatePipes() {
            //Do any pipes need removal?
            $(".pipe").filter(function () { return $(this).position().left <= -100; }).remove()

            //add a new pipe (top height + bottom height  + pipeheight == flyArea) and put it in our tracker
            var padding = 80;
            var constraint = flyArea - pipeheight - (padding * 2); //double padding (for top and bottom)
            var topheight = Math.floor((Math.random() * constraint) + padding); //add lower padding
            var bottomheight = (flyArea - pipeheight) - topheight;
            var newpipe = $('<div class="pipe animated"><div class="pipe_upper" style="height: ' + topheight + 'px;visibility:  hidden;"></div><div class="pipe_lower" style="height: ' + bottomheight + 'px;"></div></div>');
            flyareatag.append(newpipe);
            pipes.push(newpipe);
      }

      var isIncompatible = {
            Android: function () {
                  return navigator.userAgent.match(/Android/i);
            },
            BlackBerry: function () {
                  return navigator.userAgent.match(/BlackBerry/i);
            },
            iOS: function () {
                  return navigator.userAgent.match(/iPhone|iPad|iPod/i);
            },
            Opera: function () {
                  return navigator.userAgent.match(/Opera Mini/i);
            },
            Safari: function () {
                  return (navigator.userAgent.match(/OS X.*Safari/) && !navigator.userAgent.match(/Chrome/));
            },
            Windows: function () {
                  return navigator.userAgent.match(/IEMobile/i);
            },
            any: function () {
                  return (isIncompatible.Android() || isIncompatible.BlackBerry() || isIncompatible.iOS() || isIncompatible.Opera() || isIncompatible.Safari() || isIncompatible.Windows());
            }
      }

      function initAd() {

            if (!AdMob) { console.log('admob plugin not ready'); return; }
            if (/(android)/i.test(navigator.userAgent)) { // for android & amazon-fireos
                  admobid = {
                        banner: 'ca-app-pub-6285246507445010/5877630332',
                        interstitial: 'ca-app-pub-6285246507445010/7893419581'
                        /*banner: 'ca-app-pub-6869992474017983/9375997553',
                        interstitial: 'ca-app-pub-6869992474017983/1657046752'*/
                  };
            }
            trace("finalizando a inicialização do admob")
            if (AdMob) AdMob.prepareInterstitial({ adId: admobid.interstitial, autoShow: false });
            mostrarBanner();
      }

      function mostrarBanner() {
            trace("mostrar banner")
            if (ionic.Platform.isAndroid()) {
                  var largura = propaganda.width();
                  var altura = propaganda.height();
                  //alert(largura);
                  if (AdMob) {
                        AdMob.createBanner({
                              adId: admobid.banner,
                              adSize: 'CUSTOM', width: largura, height: altura,
                              overlap: true,
                              position: AdMob.AD_POSITION.POS_XY, x: 0, y: 0,
                              isTesting: true,
                              autoShow: true
                        })
                  }
            }
      }

      function mostrarInterstitial() {
            if (ionic.Platform.isAndroid()) {
                  if (AdMob) AdMob.showInterstitial();
                  trace("mostrandod interstricial")
            }
      }

      if (ionic.Platform.isAndroid()) {
            trace("iniciando admob")
            initAd();
      }else{
            trace("não é ANDROID")
      }

      function trace(texto) {
            $("#trace").html("" + texto);
      }
}