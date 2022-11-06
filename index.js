"use strict";
let ctx;
let engine;
let target;
let mousePos = null;

//壁
let walls = [
	[-100, -100, 1000, 140],
	[-100, 410, 1000, 100],
	[-100, -100, 140, 650],
	[760, -100, -100, 650],
];

//穴
let holes = [
	[35, 35],
	[400, 35],
	[765, 35],
	[35, 415],
	[400, 415],
	[765, 415],
];

//玉
let balls = [
	{x:200, y:200, c:"#FFF400"},
	{x:125, y:185, c:"#005CD3"},
	{x:150, y:170, c:"#CE2721"},
	{x:100, y:200, c:"#BD4CB8"},
	{x:175, y:215, c:"#F06700"},
	{x:125, y:215, c:"#0B8A17"},
	{x:175, y:185, c:"#B70D3A"},
	{x:150, y:230, c:"#333333"},
	{x:150, y:200, c:"#FFD300"},
	{x:650, y:200, c:"#CAFDFF"},
];

function init() {
	//エンジン初期化&イベントハンドラ設定
	engine = new Engine(-100, -100, 1000, 650, 0, 0);
	let canvas = document.getElementById("canvas");
	canvas.onmousedown = mymousedown;
	canvas.onmousemove = mymousemove;
	canvas.onmouseup = mymouseup;
	canvas.addEventListener("touchstart", mymousedown);
	canvas.addEventListener("touchmove", mymousemove);
	canvas.addEventListener("touchend", mymouseup);

	//壁
	walls.forEach(function (w) {
		//壁を構築
		let r = new RectangleEntity(w[0], w[1], w[2], w[3]);
		r.color = "gray";
		engine.entities.push(r);
	});

	//ボール
	balls.forEach(function (b) {
		//ボールを構築
		let r = new CircleEntity(b.x, b.y, 15, BodyDynamic, 0.9, 0.99);
		r.color = b.c;
		b.entity = r;
		engine.entities.push(r);
	});

	//穴
	holes.forEach(function (h) {
		let r = new CircleEntity(h[0], h[1], 20, BodyStatic);
		r.color = "rgba(255,255,255,0)";
		//穴にボールがぶつかったとき(=穴にボールが落ちた)ボールを削除する
		r.onhit = function (me, peer) {
			engine.entities = engine.entities.filter(function (e) {
				return e != peer;
			});
		}
		engine.entities.push(r);
	});
	//その他(Canvas, Timer)の初期化
	ctx = canvas.getContext("2d");
	ctx.font = "20pt Arial";
	ctx.strokeStyle = "blue";
	setInterval(tick, 50);
}

function tick() {
	//物理エンジンの時刻を進める
	engine.step(0.01);
	//再描画
	repaint();
}

//マウス押下時のコールバック関数
function mymousedown(e) {
	//マウス押下時の座標
	let mouseX = !isNaN(e.offsetX) ? e.offsetX : e.touches[0].clientX;
	let mouseY = !isNaN(e.offsetY) ? e.offsetY : e.touches[0].clientY;
	//この座標が玉に含まれているかを判定
	/*
	for (let i = 0; i < balls.length; i++) {
		if (balls[i].entity.isHit(mouseX, mouseY)) {
			target = balls[i].entity;
			mousePos = {x:mouseX, y:mouseY};
			break;
		}
	}
	*/
	if (balls[9].entity.isHit(mouseX, mouseY)) {
		target = balls[9].entity;
		mousePos = {x:mouseX, y:mouseY};
	}
}

//マウス移動時のコールバック関数
function mymousemove(e) {
	let mouseX = !isNaN(e.offsetX) ? e.offsetX : e.touches[0].clientX;
	let mouseY = !isNaN(e.offsetY) ? e.offsetY : e.touches[0].clientY;
	//手玉があるとき
	if (target) {
		mousePos = {x:mouseX, y:mouseY};
	}
}

//マウスリリース時のコールバック関数
function mymouseup(e) {
	//手玉があるとき
	if (target) {
		//現在のマウス位置mousePosと手玉targetの座標の差分から手玉に初速度を与える
		let dx = mousePos.x - target.x;
		let dy = mousePos.y - target.y;
		target.velocity.x = dx / 10;
		target.velocity.y = dy / 10;
	}
	target = null;
}

function repaint() {
	//背景クリア
	ctx.drawImage(billiard, 0, 0, 800, 450);

	//ボール・壁の描画
	for (let i = 0; i < engine.entities.length; i++) {
		let e = engine.entities[i];
		ctx.fillStyle = e.color;
		switch (e.shape) {
			case ShapeCircle:
				ctx.beginPath();
				ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
				ctx.closePath();
				ctx.fill();
				break;
		}
	}

	if (target && mousePos) {
		ctx.beginPath();
		ctx.moveTo(target.x, target.y);
		ctx.lineTo(mousePos.x, mousePos.y);
		ctx.stroke();
	}
}