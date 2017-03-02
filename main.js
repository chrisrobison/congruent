(function() {
   window.cdr = {
      config: {
         //wide:15,
         // tall:10,
         size: 120,
         border:0,
         colors: ["transparent","#990000", "#999900", "#009900", "#000099", "#990099", "#009999", "#999999", "#ee9900"],
         drkclr: ["#000000","#660000", "#666600", "#006600", "#000066", "#660066", "#006666", "#666666", "#996600"],
         lgtclr: ["#444445","#ff0000", "#ffff00", "#00ff00", "#0000ff", "#ff00ff", "#00ffff", "#ffffff", "#ffaa00"],
         color: function(c) { return "#" + 'e00ee00e009ee0e0ee335900990090039909099000'.substr(c * 3, 3); },
         difficulty: 4
      },
      queue: [],
      state: {
         score: 0,
         buttons: 0,
         rows: 0,
         cols: 0,
         board: [],
         selected: [],
         matches: []
      },
      init: function(startTime=false) {
			cdr.state.gameEnded = false;
         //cdr.config.size = Math.floor((window.innerWidth-140)/cdr.config.wide);
			if (window.innerWidth > window.innerHeight) {
				cdr.config.size = Math.round(window.innerHeight / 10);
				cdr.config.wide = Math.floor((window.innerWidth-(cdr.config.size))/cdr.config.size);
				cdr.config.tall = Math.floor((window.innerHeight-cdr.config.size)/cdr.config.size);
			} else {
				cdr.config.size = Math.round(window.innerWidth / 10);
				cdr.config.wide = Math.floor((window.innerWidth-(cdr.config.size))/cdr.config.size);
				cdr.config.tall = Math.floor((window.innerHeight-cdr.config.size)/cdr.config.size);
			}
         cdr.state.cols = cdr.config.wide;
         cdr.state.rows = cdr.config.tall;
         var go = $$("gameover");
         if (go) go.parentNode.removeChild(go);

         $$("scoreboard").style.height = cdr.config.size + 8 + "px";
         $$("board").style.top = cdr.config.size + 8 + "px";
         $$("board").style.left = cdr.config.size/2 + "px";
         $$("board").style.display = "block";
         cdr.score = $$("score");
			cdr.state.score = 0;
			cdr.updateScore(cdr.state.score);
         cdr.buttons = $$("buttons");
         // cdr.state.buttons = cdr.config.wide * cdr.config.tall;
			cdr.state.buttons = 0;
         cdr.buttons.innerHTML = cdr.state.buttons;


         document.addEventListener("click", cdr.handleClick);
         document.addEventListener("touchstart", cdr.handleClick);
         cdr.newGame();
			cdr.started = Date.now();
         cdr.time = $$("time");
			cdr.updateTime();
         
			if (startTime) {
            cdr.startClock();
         }
      }, 
      startClock: function() {
         cdr.started = Date.now();
         cdr.state.clockStarted = true;
         cdr.state.timer = setTimeout(function() { cdr.updateTime(); }, 100);
      },
      stopClock: function() {
			cdr.state.clockStarted = false;
         if (cdr.state.timer) {
            clearTimeout(cdr.state.timer);
            cdr.state.timer = 0;
         }
      },
      updateTime: function() {
         var now = Date.now();
         var elapsed = now - cdr.started;
         var psecs = Math.floor(elapsed / 100);
         var ms = psecs % 10;
         var secs = Math.floor(elapsed / 1000);
         var mins = Math.floor((elapsed / 1000) / 60);
         secs = secs - (mins * 60);
         if (secs < 10) secs = "0" + secs;
         if (mins < 10) mins = "0" + mins;

         $$("time").innerHTML = `${mins}:${secs}.${ms}`;

			if (cdr.state.clockStarted) {
				cdr.state.timer = setTimeout(function() { cdr.updateTime(); }, 100);
			}
      },
      newGame: function() {
         cdr.state.board = cdr.genBoard();
         cdr.fillBoard(cdr.state.board, true);
      },
      genBoard: function() {
         for (var r=0; r<cdr.config.tall; r++) {
            cdr.state.board[r] = [];
            for (var c=0; c<cdr.config.wide; c++) {
               cdr.state.board[r][c] = Math.round(Math.random()*(cdr.config.difficulty))+1;
            }
         }
         return cdr.state.board;
      },
      makeGem: function(id, color, count) {
         var el = document.createElement("div");
            el.classList.add("token");
            el.classList.add("gem"+color);
            if (color<0) {
               // el.style.backgroundColor = cdr.config.lgtclr[Math.abs(color)];
               // el.style.borderColor = "#fff"; // cdr.config.colors[Math.abs(cdr.state.board[r][c])];
            } else {
               // el.style.backgroundColor = cdr.config.colors[Math.abs(color)];
               // el.style.borderColor = "#000"; //cdr.config.drkclr[cdr.state.board[r][c]];
               if (color==0) {
                  el.style.backgroundImage = "none";
               }
            }
            el.style.borderWidth = cdr.config.border + "px";
            var p = cdr.rowcol(id);
            el.style.top = cdr.config.size * p[0] + "px";
            el.style.left = cdr.config.size * p[1] + "px";
            el.style.height = cdr.config.size - (cdr.config.border * 2) + "px";
            el.style.width = cdr.config.size - (cdr.config.border * 2) + "px";
            el.id = "r" + p[0] + "c" + p[1];
				if (count) {
					cdr.state.buttons++;
					cdr.buttons.innerHTML = cdr.state.buttons;
				}
            return el;
      },
      fillBoard: function(board, drop=false) {
         var g = $$("board");
         g.innerHTML = "";
         var cnt = cdr.state.rows * cdr.state.cols;
         for (var r=0; r<cdr.config.tall; r++) {
            for (var c=0; c<cdr.config.wide; c++) {
               var el = cdr.makeGem("r"+r+"c"+c, cdr.state.board[r][c], drop);
               if (drop) el.style.transform = "translateY(-"+window.innerHeight+"px)";
               if (cdr.state.board[r][c]!=0) g.appendChild(el);
               cnt--;
               if (drop) cdr.drop(el, cnt);
            }
         }
      },
      drop: function(el, cnt) {
         setTimeout(function() {
            el.style.transform = "translateY(0px)";
         }, 50 * cnt);
      },
      rowcol: function(str) {
         if (str) {
            var match = str.match(/r(\d+)c(\d+)/);
         }

         if (match) {
            return [parseInt(match[1]), parseInt(match[2])];
         } else {
            return false;
         }
      },
      whereClicked: function(x, y) {
         var r = Math.round(y / cdr.config.size),
             c = Math.round(x / cdr.config.size);

         return [r, c];
      },
      handleClick: function(event) {
         if (!cdr.state.clockStarted) {
            cdr.startClock();
         }
         var who = event.target;
         if (!who.id.match(/r(\d+)c(\d+)/)) {
            console.dir(event);
           // var [r, c] = cdr.whereClicked();

            cdr.clearMatches();
            return false;    
         }
         var [r, c] = cdr.rowcol(who.id);
         
         if (cdr.state.matches.length) {
				var matchedCount = cdr.state.matches.length - 1;
            if (cdr.checkMatches(who.id)) {
               setTimeout(function() { cdr.checkCols(); cdr.checkRows(); }, 50 * matchedCount);
               setTimeout(function() { cdr.checkRows(); cdr.checkCols(); }, 50 * matchedCount);
               setTimeout(function() { cdr.fillBoard(cdr.state.board); }, 400 * matchedCount); 
               setTimeout(function() { if (!cdr.canMove()) { cdr.doGameEnd(); } }, 5000);
            } else {
               cdr.clearMatches();
            }
         }  else {
            cdr.findMatches(who.id, cdr.state.board[r][c]);
            cdr.highlightPoints();
            setTimeout(function() {
               if (cdr.state.matches.length <= 1) {
                  cdr.clearMatches();
               } else {
                  if (window.audioBlips && audioBlips.length) playBlips(cdr.state.matches.length-1);
                  cdr.highlightPoints();
               }
            }, 40);
         }
			event.preventDefault();
			return false;
      },
      checkMatches: function(who) {
         var matched = false;
         if (cdr.state.matches.includes(who)) {
            cdr.removeMatches();
            cdr.clearMatches();
            cdr.state.matches = [];
            matched = true;
         }
         return matched;
      },
      checkRows: function() {
         for (var r=0; r<cdr.state.rows; r++) {
            var results = cdr.checkRow(r);
         }
      },
      checkRow: function(r) {
         var row = cdr.getRow(r),
             rowstr = row.join(''),
             sections = rowstr.match(/([^0]*)(0+)/y),
             el;
         
         if (sections) {
            var cursor = 0;
            for (var m=0; m<sections.length; m++) {
               var s = sections[m];
               var zs = s.match(/(0+)/);
               var z = zs ? zs[1].length : 0;
               
               var start = cursor + s.length;
               
               if (z) {
                  for (c=start; c<cdr.state.cols; c++) {
                     el = $$("r"+r+"c"+c);
                     if (el) {
                        el.style.transform += ` translateX(-${cdr.config.size * z}px)`;
                        el.id = `r${r}c${c-z}`;
                        console.log(`Updated cdr.state.board[${r}][${c-z}] with value from cdr.state.board[${r}][${c}] [${cdr.state.board[r][c]}]`);
                        cdr.state.board[r][c-z] = cdr.state.board[r][c];
                        cdr.state.board[r][c] = 0;
                     }
                  }
               }
               cursor = start;
            }
         }

         return [z, start];
      },
      checkCols: function() {
         for (var c=0; c<cdr.state.cols; c++) {
            var results = cdr.checkCol(c);
         }
      },
      checkCol: function(c) {
         var col = cdr.getCol(c),
             zeros = col.join('').replace(/^0*/,'').replace(/[^0]*/g, '').length,
             el, r;
         var lz = col.lastIndexOf("0");
         var realstart = lz - zeros;
         
         if (zeros) {
         console.log("Column " + c + " needs shifting " + zeros + " spots starting from spot " + realstart); 
         }
         
         for (r=realstart; r>-1; r--) {
            el = $$("r"+r+"c"+c);
            if (el) {
               el.style.transform = "translateY("+cdr.config.size * zeros+"px)";
               el.id = "r"+(r+zeros)+"c"+c;
               cdr.state.board[r+zeros][c] = cdr.state.board[r][c];
               cdr.state.board[r][c] = 0;
            }
         }

         return [zeros, realstart];
      },
      getRow: function(row) {
         var out = [];
         for (var c=0; c < cdr.state.cols; c++) {
            out[c] = cdr.state.board[row][c].toString();
         }
         return out;
      },
      getCol: function(col) {
         var out = [];
         for (var r=0; r < cdr.state.rows; r++) {
            out[r] = cdr.state.board[r][col].toString();
         }
         return out;
      },
      removeMatches: function() {
         cdr.calculatePoints();
         for (var i=0; i<cdr.state.matches.length; i++) {
            var p = cdr.state.matches[i].match(/r(\d+)c(\d+)/);
            cdr.state.board[p[1]][p[2]] = 0;
            cdr.state.buttons--;
         }
			cdr.buttons.innerHTML = cdr.state.buttons;

         playPops(cdr.state.matches.length);
         for (var i=0; i<cdr.state.matches.length; i++) {
            cdr.removePiece(cdr.state.matches[i], i);
         }
         //setTimeout(function() { cdr.fillBoard(cdr.state.board); },1000);
         setTimeout(function() { cdr.clearPoints(); }, 2000);

      },
      clearPoints: function() {
         var points = document.querySelectorAll(".smpoint2,.smpoint,.lgpoint");
         for (var i=0; i<points.length; i++) {
            points[i].parentNode.removeChild(points[i]);
         }
      },
      clearMatches: function() {
         for (var i=0; i<cdr.state.matches.length; i++) {
            var p = cdr.state.matches[i].match(/r(\d+)c(\d+)/);
            var el = $$(cdr.state.matches[i]);
            if (el) {
//               el.style.borderColor = "#000"; // cdr.config.drkclr[Math.abs(cdr.state.board[p[1]][p[2]])];
//               el.style.backgroundColor = cdr.config.colors[Math.abs(cdr.state.board[p[1]][p[2]])];
               el.classList.remove("selected");
            }
            cdr.state.board[p[1]][p[2]] = Math.abs(cdr.state.board[p[1]][p[2]]);
         }
         cdr.state.matches = [];
         setTimeout(function() { cdr.clearPoints(); }, 1500);
      },
      findMatches: function(who, clr, tally=0) {
         var [r, c] = cdr.rowcol(who);
         if (cdr.state.board[r][c] === clr) {
            cdr.state.board[r][c] *= -1;
            var color = cdr.config.lgtclr[Math.abs(cdr.state.board[r][c])]; 
            cdr.state.matches.push(who);
            
            // Stagger highlighting buttons for nice effect
            setTimeout(function() { 
               cdr.highlight(who, color); 
            }, cdr.state.matches.length * 40);

            if (r < cdr.state.rows-1) cdr.findMatches(`r${r+1}c${c}`, clr, tally);
            if (c < cdr.state.cols-1) cdr.findMatches(`r${r}c${c+1}`, clr, tally);
            if (r > 0) cdr.findMatches(`r${r-1}c${c}`, clr, tally);
            if (c > 0) cdr.findMatches(`r${r}c${c-1}`, clr, tally);
         }    
      },
      canMove: function() {
         for (var r=0; r<cdr.state.rows; r++) {
         //for (var r in cdr.state.board) {
            for (var c=0; c<cdr.state.cols; c++) {
            //for (var c in cdr.state.board[r]) {
               if (cdr.state.board[r][c]) {
                  if ((r < cdr.state.rows - 1) && (cdr.state.board[r+1][c]==cdr.state.board[r][c])) {
                     return true;
                  } else  if ((r > 0) && (cdr.state.board[r-1][c]==cdr.state.board[r][c])) {
                     return true; 
                  } else  if ((c < cdr.state.cols - 1) && (cdr.state.board[r][c+1]==cdr.state.board[r][c])) {
                     return true;
                  } else  if ((c > 0) && (cdr.state.board[r][c-1]==cdr.state.board[r][c])) {
                     return true;
                  }
               }
            }
         }
         return false;
      },
      minmax: function(arr) {
         var out = {
            min: {
               x:1000, 
               y:1000
            },
            max: {
               x:0, 
               y:0 
            }
         };
         for (var i=0; i<arr.length; i++) {
            var [r, c] = cdr.rowcol(arr[i]);
            var y = r * cdr.config.size;
            var x = c * cdr.config.size;
            if (x > out.max.x) out.max.x = x;
            if (x < out.min.x) out.min.x = x;
            if (y > out.max.y) out.max.y = y;
            if (y < out.min.y) out.min.y = y;
         }
         return out;
      },
      highlightPoints: function() {
         var pnt = 0;
         if (cdr.state.matches.length) {
            for (var i=0; i<cdr.state.matches.length; i++) {
               var p = Math.pow(i + 1, 2);
               pnt += p;
               setTimeout(`cdr.showPoints("${cdr.state.matches[i]}", "smpoint2", ${p});`, 50 * i);
            }
         }
      },
      calculatePoints: function() {
         var pnt = 0;
         if (cdr.state.matches.length) {
            for (var i=0; i<cdr.state.matches.length; i++) {
               var p = Math.pow(i + 1, 2);
               pnt += p;
               // setTimeout(`cdr.showPoints("${cdr.state.matches[i]}", "smpoint", ${p});`, 50 * i);
            }
         }

         var minmax = cdr.minmax(cdr.state.matches);
         var pos = {
            left: minmax.min.x + ((minmax.max.x - minmax.min.x) / 2) + 35 + 'px',
            top: minmax.min.y + ((minmax.max.y - minmax.min.y) / 2) + 70 + 'px'
         };
         var anchor = cdr.state.matches[0];
         setTimeout(function() {
            cdr.showPoints(anchor, 'lgpoint', pnt, pos);
         }, 50 * i);
         
         cdr.state.score += pnt;
         var scr = cdr.state.score;
         cdr.updateScore(scr);  
         return pnt;
      },
		updateScore: function(scr) {
			if (cdr.state.score.toString().length < 7) {
            var tmp = "0000000" + cdr.state.score;
            scr = tmp.substr(tmp.length - 7);
         }
         
         $$("score").innerHTML = scr;
		},
      showPoints: function(who, classname='smpoint', amt, pos) {
         var [r, c] = cdr.rowcol(who);
         var el = document.createElement('span');
         el.classList.add(classname);
         el.innerHTML = "+" + amt;
         document.body.appendChild(el);
         
         if (!pos) {
            el.style.top = (r * cdr.config.size) + cdr.config.size + "px";
            el.style.left = (c * cdr.config.size) + cdr.config.size + "px";
         } else {
            el.style.top = pos.top;
            el.style.left = pos.left;
         }

      },
      highlight: function(who, color) {
         $$(who).classList.add('selected');
         // $$(who).style.borderColor = "#fff";
         // $$(who).style.backgroundColor = color;
      },
      updateBoard: function() {
         for (var r=0; r<cdr.state.board.length; r++) {
            for (var c=0; c<cdr.state.cols; c++) {
               var elstr = "r" + r + "c" + c;
               var el = $$(elstr);
               if (el) {
                  el.style.top = r * cdr.config.size + "px";
                  el.style.left = c * cdr.config.size + "px";
               } else {
                  el = document.createElement("div");
               }
            }
         }
      },
      getCoord: function(who) {
         var [r, c] = cdr.rowcol(who);
         return [(c * cdr.config.size) + (cdr.config.size / 2), (r * cdr.config.size) + (cdr.config.size / 2)];
      },
		explode: function(x, y, delay) {
			var p = new Particle();
			p.init();
			setTimeout(function() { p.explode(x, y, 1); }, delay);
		},
      removePiece: function(piece, cnt) {
         var parts = cdr.rowcol(piece);
			console.log(parts);
			var [x, y] = cdr.getCoord(piece);
			console.log("Removing "+piece+ " x:"+x+" y:"+y);
			// cdr.explode((x*2)+(cdr.config.size), (y*2) + (cdr.config.size), 50 * cnt);
			var el = $$(piece);
			el.style.height="60px";
			el.style.width = "60px";
         setTimeout(function() {
            var [x, y] = cdr.getCoord(piece);
            
            if (el) {
					el.classList.add("poof");
               el.style.backgroundColor = "none";
               el.style.zIndex = 99999;
               el.style.border = "none";
               el.style.height="60px";
               el.style.width = "60px";
               el.classList.add("poof");
               el.style.transform = "scale(2)";

            //   el.classList.add("remove");
            //   el.classList.remove("token");
               setTimeout(function() {
            //      el.style.transform = "scale(3)";
                   el.style.opacity = 0;
                   // el.parentNode.removeChild(el);
               }, (50*cnt) + 1500);
            }
         }, 50*cnt);
      },
      dumpBoard: function() {
         var out = "";
         for (var r=0; r<cdr.state.board.length; r++) {
            out += "\n";
            for (var c=0; c<cdr.state.board[r].length; c++) {
               out += cdr.state.board[r][c];
            }
         }
         console.log(out);
      },
      doGameEnd: function() {
			if (cdr.state.gameEnded) return;
			cdr.state.gameEnded = true;
         playSound(audioDefeat);
         playSound(audioVictory);
         cdr.stopClock();
         var highscore = localStorage.getItem("highscore");
         var amhigh = false;
         if (!highscore) {
            highscore = cdr.state.score;
            amhigh = true;
         } else if (cdr.state.score > highscore) {
            highscore = cdr.state.score;
            amhigh = true;
         }
         var el = document.createElement("div");
         el.id = "gameover";
         el.classList.add("gameover");
         var str = "<h1>GAME OVER</h1><h2><a href='#' onclick='cdr.init(); return false;'>Play Again?</a></h2>";
         if (amhigh) {
            localStorage.setItem("highscore", highscore);
            str += "<hr><h1>NEW HIGH SCORE!!!</h1><h2 class='highscore'>"+highscore+"</h2><br>";
            str += "<div class='initials'><input type='text' id='initial1' size='1'/><input type='text' id='initial2' size='1'/><input type='text' id='initial3' size='1'/></div>";

         }
         el.innerHTML = str;
         document.body.appendChild(el);
         $$("board").style.zIndex = "1";
      }
   };
})();
function $$(str) { return document.getElementById(str); }
setupAudio();
cdr.init();
document.addEventListener("mouseover", function(event) { 
   var m;
   if (m = event.target.id.match(/r(\d+)c(\d+)/)) {
      if (window.audioClicks && audioClicks.length) {
			playSound(audioClicks[cdr.state.board[m[1]][m[2]]]);
		}
   }
});
document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});
