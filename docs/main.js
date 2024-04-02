function binarySearch(min, max, test) {
	let cursor = (min + max) / 2;
	while(true) {
		if(test(cursor)) min = cursor;
		else max = cursor;
		if(Math.abs(max - min) < 0.1) return min;
		cursor = (min + max) / 2;
	}
}

function resize() {
	if(typeof Alpine == "undefined") return;
	const data = Alpine.store("data");
	if(!data.play) return;
	const root = document.querySelector(":root");
	const el = document.querySelector(".array");
	const body = document.querySelector("body");
	const rect = body.getBoundingClientRect();

	// Due to unknown reason, even as we set the height of the body to be 100dvh,
	// as we toggle fullscreen the height can still go beyond screen.height,
	// so we safe-guard the value here.
	const height = Math.min(screen.height, rect.height);
	const n = data.max;

	// Solve for size;
	const size = binarySearch(0, Math.min(rect.width, height),
		s => s * Math.ceil(n / Math.floor(rect.width / s)) <= height
	);
	root.style.setProperty("--size", size + "px");

	// Tighten the arrangement
	const rows = Math.floor(height / size);
	const columns = Math.ceil(n / rows);
	el.style.paddingInline = (rect.width - columns * size) / 2 + "px";
	el.style.maxHeight = height + "px";
}

function createShuffledArray(n, factory) {
	const arr = Array.from({ length: n + 1 }, (_, i) => factory(i));
	for(let i = n; i > 1; i--) {
		const j = Math.floor(Math.random() * i) + 1;
		if(i != j) [arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

addEventListener("resize", resize);
document.addEventListener("alpine:init", () => Alpine.store("data", {
	play: false,
	time: 0,
	max: 10,
	columns: 1,
	text: [],
	color: [],
	flipped: [],
	pendingCancel: 0,
	pendingCount: 0,
	cancelTimeout: 0,
	click(i) {
		this.flipped[i] = 1;
	},
	cancel(i) {
		if(this.pendingCancel == i) {
			clearTimeout(this.cancelTimeout);
			this.cancelTimeout = setTimeout(() => this.pendingCount = 0, 200);
			this.pendingCount++;
			if(this.pendingCount >= 3) {
				this.pendingCount = 0;
				this.flipped[i] = 0;
			}
		} else {
			this.pendingCancel = i;
			this.pendingCount = 0;
		}
	},
	start() {
		const n = this.max;
		this.play = true;
		const t = createShuffledArray(n, i => i);
		this.color = createShuffledArray(n, i => `hsl(${i / n * 360}deg 75% 75%)`);
		this.text = t;
		this.flipped = [];
		this.time = new Date().getTime();
		document.body.requestFullscreen();
	},
}));