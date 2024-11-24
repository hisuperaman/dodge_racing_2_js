class Car {
    constructor(x, y, canvasWidth, sprite, carType="MANUAL", maxSpeed=3) {
        this.x = x;
        this.y = y;
        this.initialY = y;

        this.width = 35;
        this.height = 60;

        this.canvasWidth = canvasWidth;


        this.speed = 0;
        this.maxSpeed = maxSpeed;
        this.acceleration = 0.2;
        this.friction = 0.05;

        this.angle = 0;
        this.angleInterval = 0.03;
        this.directionFactor = 1;

        this.sprite = sprite;

        this.polygon = [];
        this.damaged = false;

        this.controls = new Controls(carType);

        this.carType = carType;

        this.passed = false;
        this.speedUpdated = false;
    }

    update(roadBorders, traffic, gameScore=0, handleGameover=()=>{} ) {
        if(!this.speedUpdated && (gameScore!=0 && gameScore % 50 == 0)) {
            this.maxSpeed += 0.2;
            this.speedUpdated = true;
        }

        if(!this.damaged) {
            this.#move();
    
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);
        }
        else {
            if(handleGameover) {
                handleGameover();
            }
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for(let i=1; i<this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.angle);
        ctx.drawImage(this.sprite, -this.width/2, -this.height/2, this.width, this.height);
        ctx.restore();
        
        ctx.closePath();
    }

    #assessDamage(roadBorders, traffic) {
        for(let i=0; i<roadBorders.length; i++) {
            if(polysIntersect(this.polygon, roadBorders[i])) {
                return true;
            }
        }
        for(let i=0; i<traffic.length; i++) {
            if(polysIntersect(this.polygon, traffic[i].polygon)) {
                return true;
            }
        }
        return false;
    }

    #createPolygon() {
        const points = [];
        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);
        points.push({
            x: this.x-Math.sin(this.angle-alpha)*rad,
            y: this.y-Math.cos(this.angle-alpha)*rad
        })
        points.push({
            x: this.x-Math.sin(this.angle+alpha)*rad,
            y: this.y-Math.cos(this.angle+alpha)*rad
        })
        points.push({
            x: this.x-Math.sin(Math.PI+this.angle-alpha)*rad,
            y: this.y-Math.cos(Math.PI+this.angle-alpha)*rad
        })
        points.push({
            x: this.x-Math.sin(Math.PI+this.angle+alpha)*rad,
            y: this.y-Math.cos(Math.PI+this.angle+alpha)*rad
        })

        return points;
    }

    #move() {
        if(this.controls.forward) {
            this.speed += this.acceleration;
            this.directionFactor = 1;
        }
        if(this.controls.reverse) {
            this.speed -= this.acceleration;
            this.directionFactor = -1;
        }

        if(this.speed != 0){
            if(this.controls.left) {
                this.angle += this.angleInterval/(this.directionFactor==-1 ? 2 : 1) * this.directionFactor;
            }
            if(this.controls.right) {
                this.angle -= this.angleInterval/(this.directionFactor==-1 ? 2 : 1) * this.directionFactor;
            }
        }
        

        if(this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        if(this.speed < -this.maxSpeed/2) {
            this.speed = -this.maxSpeed/2;
        }

        if(this.speed > 0) {
            this.speed -= this.friction;
        }
        if(this.speed < 0) {
            this.speed += this.friction;
        }

        if(Math.abs(this.speed) < this.friction) {
            this.speed = 0;
        }

        this.y -= Math.cos(this.angle) * this.speed;
        this.x -= Math.sin(this.angle) * this.speed;
    }
}