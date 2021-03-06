const canvas = document.getElementById('draw_canvas');
const div = document.getElementById('canvas_div');
const ctx = canvas.getContext('2d');
const databox = document.getElementById("databox");

const new_worker_probability = 1/64;
const two_new_workers_probability = 2/3;
const colour_range = 60;
const first_line_text = "SCAN UNITS: ";

let furthest_worker_distance = 1;
let old_furthest_worker_distance = 1;

let frame = 0;
let reset_state = 0;
let data_line = 2;

let workers = [];
let explored = [];

canvas.width = div.clientWidth;
canvas.height = div.clientHeight;

const center_x = Math.floor(canvas.width/2);
const center_y = Math.floor(canvas.height/2);

let data_lines = new Array(15).fill("");
data_lines[0] = first_line_text + 0
data_lines[1] = "----------"

ctx.fillStyle = "#000000"
ctx.fillRect(0,0,canvas.width,canvas.height);


class Worker {
    x=0;
    y=0;
    direction = Math.PI;
    life = 0;
    colour = 0;
    min_life_before_branching = 10;

    constructor(x,y,dir,col) {
        this.x = x;
        this.y = y;
        this.direction = dir;
        this.colour = col;
    }
}


function update() {
    frame++;

    // reset transition
    if (reset_state > 0) {
        if (reset_state < 50) {
            ctx.globalAlpha = .1;
            ctx.fillStyle = "#000000"
            ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.globalAlpha = 1;
        }

        reset_state--;
        console.log('reset' + reset_state)

        if (reset_state == 0) {
            ctx.fillRect(0,0,canvas.width,canvas.height);
            start();
        }

        drawEntryPoint();
        
        requestAnimationFrame(update)
        return;
    }

    
    // Databox stuff
    if (frame % 30 == 0)
        data_lines[0] = first_line_text + workers.length;
    
    data_line = 3 + (data_line+1) % 11;
    data_lines[data_line] = (furthest_worker_distance + 10*Math.random());

    // The fun
    var new_workers = [];
    workers.forEach(worker => {
        var r = Math.random();
        var r2 = Math.random();

        if (worker.life > worker.min_life_before_branching && r < new_worker_probability) {
            if (r2 < two_new_workers_probability) {
                var deg1 = (Math.random() > .5 ? Math.PI/2 : Math.PI/4);
                var w1 = new Worker(worker.x, worker.y, worker.direction + deg1, worker.colour+1);
                
                var deg2 = (Math.random() > .5 ? Math.PI/2 : Math.PI/4);
                var w2 = new Worker(worker.x, worker.y, worker.direction - deg2, worker.colour+1);

                new_workers.push(w1);
                new_workers.push(w2);
            } else {
                var w = new Worker(worker.x,worker.y,worker.direction+Math.PI/2, worker.colour+1);
                new_workers.push(w);
            }
        } else {

            if (worker.x <= 0 || worker.y <= 0 || worker.x >= canvas.width-1 || worker.y >= canvas.height-1)
                return;

            if ( worker.life > 2 && explored[worker.y][worker.x] != 0) {
                return;
            }

            furthest_worker_distance = Math.max(furthest_worker_distance, Math.sqrt((worker.x-center_x)**2 + (worker.y-center_y)**2));
        
            
            ctx.fillStyle = 'hsl(' +
                (worker.colour % colour_range) * 360/colour_range +
            ',50%,50%)'
            ctx.globalAlpha = .15;
            ctx.fillRect(worker.x-1,worker.y-1,3,3);
            ctx.globalAlpha = 1;
            ctx.fillRect(worker.x,worker.y,1,1);
            
            explored[worker.y][worker.x] = 1;

            worker.x += Math.round(Math.cos(worker.direction));
            worker.y += Math.round(Math.sin(worker.direction));

            worker.life++;

            new_workers.push(worker);
        }
    });
    workers = new_workers;

    if (workers.length == 0)
        reset();
    
    updateDatabox();
    drawEntryPoint();

    requestAnimationFrame(update)
}

function reset() {
    reset_state = 100;
    
    data_lines[0] = first_line_text + 0;
    data_lines[2] = "";
    data_lines[3] = "";
    data_lines[4] = "MAXIMUM COVERAGE.";
    data_lines[5] = "";
    data_lines[6] = "";
    data_lines[7] = "PIVOTING";
    data_lines[8] = "TO NEW";
    data_lines[9] = "ENTRY POINT";
    data_lines[10] = "";
    data_lines[11] = "";
    data_lines[12] = "";
    data_lines[13] = "";

    updateDatabox();
}

function start() {
    for(var y = 0; y < canvas.height; y++) {
        explored[y] = new Array(canvas.width).fill(0);
    }

    workers.push(new Worker(center_x, center_y-15, -Math.PI/2, 0));
    workers.push(new Worker(center_x-20, center_y+15, -4/3 * Math.PI, 0));
    workers.push(new Worker(center_x+20, center_y+15, -5/3 * Math.PI, 0));
    
    workers[0].min_life_before_branching = 50;
    workers[1].min_life_before_branching = 50;
    workers[2].min_life_before_branching = 50;

    furthest_worker_distance = 0;

}

function updateDatabox() {
    var output_lines = "";
    data_lines.forEach(line => {
        output_lines += line + "<br>";
    });
    databox.innerHTML = output_lines;
}

function drawEntryPoint() {
    ctx.fillStyle = "#000000"

    var textwidth = 140;
    ctx.fillRect(center_x-textwidth/2,center_y+22, textwidth, 22);

    ctx.beginPath();
    ctx.moveTo(center_x,center_y-15);
    ctx.lineTo(center_x+20,center_y+15);
    ctx.lineTo(center_x-20,center_y+15);
    ctx.lineTo(center_x,center_y-15);
    ctx.fill();
    ctx.strokeStyle = 'rgb(255,0,0)'
    ctx.stroke();

    
    ctx.strokeRect(center_x-textwidth/2,center_y+22, textwidth, 22);
    
    ctx.font = "20px Courier New";
    ctx.textAlign = "center";   
    ctx.strokeText("ENTRY POINT", center_x, center_y + 40);

}

start();        
update();