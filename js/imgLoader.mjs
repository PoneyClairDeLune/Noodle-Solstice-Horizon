// Adaptive image loader 0.0.1, from Carousel
// 2024 (C) Lumière Élevé
// Licensed under MIT License

"use strict";

const mimePool = {
	// Modern formats
	"jxl": "jxl", // Fuck you Google US, all hail JPEG XL, Cloudinary and Google Zurich
	"avif": "avif", // Chrome 85+, Firefox 93+, Safari 16.4+
	"heic": "heic", // Safari 17+
	"webp": "webp", // Windows XP and up
	// Legacy formats
	"jpg": "jpeg",
	"jpeg": "jpeg",
	"gif": "gif",
	"bmp": "bmp",
	// Lossless formats
	"png": "png",
	"apng": "apng"
};
const attributeBlocklist = {};
`id,title,class,style,name,src,srcroot,types,passthru`.split(",").forEach((e) => {
	attributeBlocklist[e] = true;
});

const imageLoadHandler = function () {
	this.parentElement.getAttribute("types").split(",").forEach((e) => {
		if (this.currentSrc.indexOf(e) + e.length == this.currentSrc.length) {
			this.classList.add(`carousel-ail-${mimePool[e]}`);
		};
	});
};

for (let e of document.querySelectorAll("picture[types]")) {
	if (!e.hasAttribute("srcroot")) {
		console.warn(`[Image Loader] The element does not have a source root.\n`, e);
		continue;
	};
	let types = e.getAttribute("types").split(",");
	let srcRoot = e.getAttribute("srcroot");
	let passThruAttrs = {};
	e.getAttribute("passthru")?.toLowerCase().split(",").forEach((e) => {
		passThruAttrs[e] = true;
	});
	for (let i0 = 0; i0 < types.length; i0 ++) {
		let type = types[i0].trim();
		let matchType = type.toLowerCase();
		let matchedMime = mimePool[matchType];
		if (matchedMime) {
			let lastCriteria = types.length - 1;
			let appendedElement;
			if (i0 == lastCriteria) {
				appendedElement = document.createElement("img");
				appendedElement.classList.add("carousel-ailview");
				appendedElement.src = `${srcRoot}.${type}`;
				let sourceAttrs = e.getAttributeNames();
				for (let sourceAttr of sourceAttrs) {
					if (attributeBlocklist[sourceAttr] && !passThruAttrs[sourceAttr]) {
						continue;
					};
					if (sourceAttr.substring(0, 2) == "on" && !passThruAttrs[sourceAttr]) {
						continue;
					};
					appendedElement.setAttribute(sourceAttr, e.getAttribute(sourceAttr));
					e.removeAttribute(sourceAttr);
				};
				appendedElement.addEventListener("load", imageLoadHandler);
			} else {
				appendedElement = document.createElement("source");
				appendedElement.srcset = `${srcRoot}.${type}`;
				appendedElement.type = `image/${matchedMime}`;
			};
			e.append(appendedElement);
		} else {
			console.warn(`[Image Loader] Unsupported type "${type}".\n`, e);
		};
	};
};
