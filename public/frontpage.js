const canvas = document.getElementById("canvas")
if (canvas) {

    const slides = document.querySelectorAll('.slide');
  
    let currentSlide = 1;
  
    // Function to handle intersection events
    const handleIntersection = (entries, observer) => {
      entries.forEach(entry => {
        const rect = entry.target.getBoundingClientRect();
        const slideId = entry.target.id;
        const slideIndex = parseInt(slideId.replace('slide', ''), 10);
  
        if (rect.top <= window.innerHeight * 0.8 && rect.bottom >= window.innerHeight * 0.2) {
          if (currentSlide !== slideIndex) {
            currentSlide = slideIndex;
            window.slide = currentSlide;
            // console.log(`Current slide is now: ${window.slide}`);
          }
        }
      });
    };
  
    // Create the intersection observer
    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '0px',
      threshold: [0, 0.5, 1] // Multiple thresholds to detect visibility changes more reliably
    });
  
    // Observe each slide
    slides.forEach(slide => {
      observer.observe(slide);
    });
  
    // Update slide state on load, resize, and scroll
    const updateSlideState = () => {
      slides.forEach(slide => {
        const rect = slide.getBoundingClientRect();
        const slideId = slide.id;
        const slideIndex = parseInt(slideId.replace('slide', ''), 10);
  
        if (rect.top <= window.innerHeight * 0.8 && rect.bottom >= window.innerHeight * 0.2) {
          if (currentSlide !== slideIndex) {
            currentSlide = slideIndex;
            window.slide = currentSlide;
            // console.log(`Current slide is now: ${window.slide}`);
          }
        }
      });
    };

      // Initial update on load
  updateSlideState();

  // Update on resize and scroll
  window.addEventListener('resize', updateSlideState);
  window.addEventListener('scroll', updateSlideState);


    const bridgeButton = document.querySelector('a[href="/bridge"]');
    if (bridgeButton) {
        bridgeButton.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent the default link behavior
        window.removeEventListener('resize', updateSlideState);
        window.removeEventListener('scroll', updateSlideState);
        window.location.href = '/bridge'; // Change the URL
        });
    }

    // special thanks to:
    // https://stackoverflow.com/questions/46436270/hyperdrive-effect-in-canvas-across-randomly-placed-circles

    const ctx = canvas.getContext("2d")

    // High performance array pool using buubleArray to separate pool objects and active object.
    // This is designed to eliminate GC hits involved with particle systems and 
    // objects that have short lifetimes but used often.
    // Warning this code is not well tested.
    const bubbleArray = () => {
        const items = []
        var count = 0
        return {
            clear() {  // warning this dereferences all locally held references and can incur Big GC hit. Use it wisely.
                this.items.length = 0
                count = 0
            },
            update() {
                var head, tail
                head = tail = 0
                while (head < count) {
                    if (items[head].update() === false) { head += 1 }
                    else {
                        if (tail < head) {
                            const temp = items[head]
                            items[head] = items[tail]
                            items[tail] = temp
                        }
                        head += 1
                        tail += 1
                    }
                }
                return count = tail
            },
            createCallFunction(name, earlyExit = false) {
                name = name.split(" ")[0]
                const keys = Object.keys(this)
                if (Object.keys(this).indexOf(name) > -1) { throw new Error(`Can not create function name '${name}' as it already exists.`) }
                if (!/\W/g.test(name)) {
                    let func
                    if (earlyExit) {
                        func = `var items = this.items; var count = this.getCount(); var i = 0;\nwhile(i < count){ if (items[i++].${name}() === true) { break } }`
                    } else {
                        func = `var items = this.items; var count = this.getCount(); var i = 0;\nwhile(i < count){ items[i++].${name}() }`
                    }
                    !this.items && (this.items = items)
                    this[name] = new Function(func)
                } else { throw new Error(`Function name '${name}' contains illegal characters. Use alpha numeric characters.`) }

            },
            callEach(name) { var i = 0; while (i < count) { if (items[i++][name]() === true) { break } } },
            each(cb) { var i = 0; while (i < count) { if (cb(items[i], i++) === true) { break } } },
            next() { if (count < items.length) { return items[count++] } },
            add(item) {
                if (count === items.length) {
                    items.push(item)
                    count++
                } else {
                    items.push(items[count])
                    items[count++] = item
                }
                return item
            },
            getCount() { return count },
        }
    }

    // Helpers rand float, randI random Int
    // doFor iterator
    // sCurve curve input -Infinity to Infinity out -1 to 1
    // randHSLA creates random colour
    // CImage, CImageCtx create image and image with context attached
    const randI = (min, max = min + (min = 0)) => (Math.random() * (max - min) + min) | 0
    const rand = (min = 1, max = min + (min = 0)) => Math.random() * (max - min) + min
    const doFor = (count, cb) => { var i = 0; while (i < count && cb(i++) !== true); } // the ; after while loop is important don't remove

    const sCurve = (v, p) => (2 / (1 + Math.pow(p, -v))) - 1
    const randHSLA = (h, h1, s = 100, s1 = 100, l = 50, l1 = 50, a = 1, a1 = 1) => { return `hsla(${randI(h, h1) % 360},${randI(s, s1)}%,${randI(l, l1)}%,${rand(a, a1)})` }
    // canvas settings
    var w = canvas.width
    var h = canvas.height
    var cw = w / 2  // center 
    var ch = h / 2
    // diagonal distance used to set point alpha (see point update)
    var diag = Math.sqrt(w * w + h * h)
    // If window size is changed this is called to resize the canvas
    // It is not called via the resize event as that can fire to often and
    // debounce makes it feel sluggish so is called from main loop.
    function resizeCanvas() {
        points.clear()
        canvas.width = innerWidth
        canvas.height = innerHeight
        w = canvas.width
        h = canvas.height
        cw = w / 2  // center 
        ch = h / 2
        diag = Math.sqrt(w * w + h * h)

    }
    // create array of points
    const points = bubbleArray()
    // create optimised draw function itterator
    points.createCallFunction("draw", false)
    // spawns a new star
    function spawnPoint(pos) {
        var p = points.next()
        p = points.add(new Point())
        if (p === undefined) { p = points.add(new Point()) }
        p.reset(pos)
    }
    // point object represents a single star
    function Point(pos) {  // this function is duplicated as reset 
        if (pos) {
            this.x = pos.x
            this.y = pos.y
            this.dead = false
        } else {
            this.x = 0
            this.y = 0
            this.dead = true
        }
        this.alpha = 0
        var x = this.x - cw
        var y = this.y - ch
        this.dir = Math.atan2(y, x)
        this.distStart = Math.sqrt(x * x + y * y)
        this.speed = rand(0.01, 1)
        this.col = randHSLA(220, 280, 100, 100, 50, 100)
        this.dx = Math.cos(this.dir) * this.speed
        this.dy = Math.sin(this.dir) * this.speed
    }
    Point.prototype = {
        reset: Point,  // resets the point
        update() {       // moves point and returns false when outside 
            this.speed *= hyperSpeed  // increase speed the more it has moved
            this.x += Math.cos(this.dir) * this.speed
            this.y += Math.sin(this.dir) * this.speed
            var x = this.x - cw
            var y = this.y - ch
            this.alpha = (Math.sqrt(x * x + y * y) - this.distStart) / (diag * 0.5 - this.distStart)
            if (this.alpha > 1 || this.x < 0 || this.y < 0 || this.x > w || this.h > h) {
                this.dead = true
            }
            return !this.dead
        },
        draw() {  // draws the point 
            ctx.strokeStyle = this.col
            ctx.globalAlpha = 0.25 + this.alpha * 0.75
            ctx.beginPath()
            ctx.lineTo(this.x - this.dx * this.speed, this.y - this.dy * this.speed)
            ctx.lineTo(this.x, this.y)
            ctx.stroke()

        }
    }

    const maxStarCount = 400
    const p = { x: 0, y: 0 }
    var hyperSpeed = 1.001
    const alphaZero = sCurve(1, 2)
    var startTime
    function loop(time) {

        if (startTime === undefined) {
            startTime = time
        }
        if (w !== innerWidth || h !== innerHeight) {
            resizeCanvas()
        }
        // if mouse down then go to hyper speed
        if (window.slide === 3) {
            if (hyperSpeed < 1.4) {
                hyperSpeed += 0.005
            } else if (hyperSpeed < 1.75) {
                hyperSpeed += 0.01
            }
        } else if (window.slide === 2) {
            if (hyperSpeed < 1.02) {
                hyperSpeed += 0.01
            } else if (hyperSpeed > 1.03) {
                hyperSpeed -= 0.01
            } else if (hyperSpeed > 1.021) {
                hyperSpeed -= 0.001
            }
        } else {
            if (hyperSpeed > 1.01) {
                hyperSpeed -= 0.01
            } else if (hyperSpeed > 1.001) {
                hyperSpeed -= 0.001
            }
        }

        var hs = sCurve(hyperSpeed, 2)
        ctx.globalAlpha = 1
        ctx.setTransform(1, 0, 0, 1, 0, 0) // reset transform


        //==============================================================
        // UPDATE the line below could be the problem. Remove it and try
        // what is under that        
        //==============================================================
        //ctx.fillStyle = `rgba(0,0,0,${1-(hs-alphaZero)*2})`;

        // next two lines are the replacement
        ctx.fillStyle = "Black"
        ctx.globalAlpha = 1 - (hs - alphaZero) * 2
        //==============================================================



        ctx.fillRect(0, 0, w, h)
        // the amount to expand canvas feedback
        var sx = (hyperSpeed - 1) * cw * 0.1
        var sy = (hyperSpeed - 1) * ch * 0.1

        // increase alpha as speed increases
        ctx.globalAlpha = (hs - alphaZero) * 2
        ctx.globalCompositeOperation = "lighter"
        // draws feedback twice
        ctx.drawImage(canvas, -sx, -sy, w + sx * 2, h + sy * 2)
        ctx.drawImage(canvas, -sx / 2, -sy / 2, w + sx, h + sy)
        ctx.globalCompositeOperation = "source-over"

        // add stars if count < maxStarCount 
        if (points.getCount() < maxStarCount) {
            var cent = (hyperSpeed - 1) * 0.5 // pulls stars to center as speed increases
            doFor(10, () => {
                p.x = rand(cw * cent, w - cw * cent)  // random screen position
                p.y = rand(ch * cent, h - ch * cent)
                spawnPoint(p)

            })
        }
        // as speed increases make lines thicker
        const isMobile = window.innerWidth < 768
        if(isMobile) {
            ctx.lineWidth = 2 + hs * 2
        } else {
            ctx.lineWidth = 3 + hs * 2
        }
        ctx.lineCap = "round"
        points.update()  // update points
        points.draw()     // draw points
        ctx.globalAlpha = 1

        requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)

}
