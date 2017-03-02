Particle = function() { 
   return {
      particle: {
            velocity :null,
            position : null,

            /// dummy constructor
            create : function(x,y,speed,angle,color) {
               console.log(x,y,speed,angle)
               var obj=Object.create(this);
               obj.velocity = Particle().vector.create(0,0);
               
               obj.velocity.setLength(speed);
               obj.velocity.setAngle(angle);
               obj.position = Particle().vector.create(x,y);
               obj.created = Date.now();
               obj.color = color;
               console.log("object")
               console.log(obj);
               return obj;
            },

            update: function(){
               this.position.addTo(this.velocity);
            }

         },
         vector: {
            _x:0,
            _y:0,

            // dummy constructor
            create : function(x,y){var obj= Object.create(this);obj._y=y; obj._x=x; return obj;},

            // member functions
            getX : function(){ return this._x},
            getY : function(){ return this._y},
            setX : function(value){  this._x=value;},
            setY : function(value){  this._y=value;},
            getLength : function(){ return Math.sqrt(this._x*this._x + this._y*this._y)},
            getAngle : function(){ return Math.atan2(this._y,this._x) },
            setAngle : function(angle){ length=this.getLength(); this._y =Math.cos(angle)*length; this._x= Math.sin(angle)*length; },
            setLength: function(length){ angle=this.getAngle(); this._y=Math.cos(angle)*length; this._x=Math.sin(angle)*length; },
            add : function(v2){     vect = this.create(this._x+v2._x, this._y+v2._y);  return vect;    },
            subtract : function(v2){   vect = this.create(this._x-v2._x, this._y-v2._y);  return vect;    },
            multiply: function(value){ return vector.create(this._x*value,this._y*value)},
            divide: function(value){ return vector.create(this._x/value,this._y/value)},
            scale: function(value){ this._x=this._x*value; this._y=this._y*value;},
            addTo: function(v2){ this._x=this._x+v2._x; this._y=this._y+v2._y },
            subtractFrom: function(v2){ this._x=this._x-v2._x; this._y=this._y-v2._y }
         },

         init: function(){
            // this.canvas=document.getElementById("canvas");
            this.canvas=document.createElement("canvas");
            this.canvas.style.position = "absolute";
            this.canvas.style.top = "0px";
            this.canvas.style.left = "0px";
            this.canvas.style.width = window.innerWidth  + "px";
            this.canvas.style.height = window.innerHeight + "px";

            var ccnt = document.querySelectorAll("canvas");

            this.canvas.id = "canvas" + ccnt.length;

            document.body.appendChild(this.canvas);
            var that = this;
            this.canvas.addEventListener("click", function(event) {
               that.explode(event.clientX, event.clientY); 
               cdr.handleClick(event);
            });
            this.context=this.canvas.getContext("2d");
            this.width=this.canvas.width=window.innerWidth;
            this.height=this.canvas.height=window.innerHeight;
            this.numparticles=20;
            this.duration=250;
            this.radius = 10;
            window.particles = [];

         },
         
         explode: function(x, y, color) {
            for(i=0;i<this.numparticles;i++) {
               window.particles.push(this.particle.create(x, y, (Math.random() * 10) + 1, Math.random() * Math.PI * 2, color || 1))
            }
            this.started = Date.now();
            this.step = 1 / this.duration;
            this.alpha = 1;
            this.size = this.radius;
            this.sstep = this.radius / this.duration;
            this.colors = {red: 255, green: 255, blue: 255};
				
				setTimeout(function() { 
					if (this.canvas && this.canvas.parentNode) {
						this.canvas.parentNode.removeChild(this.canvas); 
					}
				}, this.duration);
            this.update.call(this);
         },

         update: function(){
            this.context.clearRect(0, 0, this.width, this.height);
            var ddiff = Date.now() - this.started;
            this.alpha = 1 - (ddiff * this.step);
            this.size = (this.radius + 0.1) - (ddiff * this.sstep);
            if (this.size < 0) {
               this.size = 0.01;
            }
            var colors = [`rgba(255, 255, 255, ${this.alpha})`, `rgba(255, 0, 0, ${this.alpha})`, `rgba(255, 255, 0, ${this.alpha})`, `rgba(0, 255, 0, ${this.alpha})`, `rgba(0, 150, 255, ${this.alpha})`, `rgba(255, 0, 255, ${this.alpha})`];
            for (var i = 0; i < window.particles.length; i++) {
               window.particles[i].update();
               this.context.beginPath();
               this.context.fillStyle = colors[window.particles[i].color];
               this.context.arc(window.particles[i].position.getX(), window.particles[i].position.getY(), this.size, 0, 2*Math.PI, false);
               this.context.fill();
               if ((Date.now() - window.particles[i].created) > this.duration) {
                  window.particles.splice(i, 1);
               }
            }
            
            if (ddiff < this.duration) {
               var that = this;
               requestAnimationFrame(function() { that.update.call(that); });
            } else {
					if (this.canvas && this.canvas.parentNode) {
						this.canvas.parentNode.removeChild(this.canvas);
					}
				}
         }
      }
   };
