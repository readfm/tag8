var zooms = {};

class Zoomer{
	constructor(node){
		node.removeEventListener('mousemove', ev => this.hover(ev), false);
		node.addEventListener('mousemove', ev => this.hover(ev), false);

		node.removeEventListener('mouseleave', ev => this.leave(ev), false);
		node.addEventListener('mouseleave', ev => this.leave(ev), false);

		this.src = Zoomer.getSrc(node);
		console.log(this.src);

		zooms[this.src] = this;
	}

	create(){
		this.container = document.createElement("div");
		this.container.classList.add('zoomer');

		this.container.style.display = 'none';

		var img = this.img = new Image();
		img.src = this.src;
		img.onload = ev => {
			this.container.style.width = img.width+'px';
			this.container.style.height = img.height+'px';
		};

		this.container.appendChild(img);

		var txt = this.textarea = document.createElement('textarea');
		txt.value = localStorage.getItem('tag8s$'+this.src) || '';
		this.container.appendChild(txt);

		document.body.appendChild(this.container);
	}

	//get exact path of real image.
	static getSrc(node){
		var url = node.src || node.href;
		if(!url) return;

		var qs = Zoomer.parseQS(decodeURIComponent(url));
		if(qs && qs.imgurl)
			url = qs.imgurl;


		qs = Zoomer.parseQS(decodeURIComponent(node.parentNode.href));
		if(qs && qs.imgurl)
			url = qs.imgurl;

		if(url.indexOf('imgur.com')+1){
			var parts = url.replace(/^(https?|ftp):\/\//, '').split('/'),
				ext = ''+url.split('.').pop();

			if(['jpg', 'jpeg', 'gif', 'png'].indexOf(ext)+1)
				return url;

			return 'http://i.imgur.com/'+parts[1]+'.jpg';
		}
		else
		if(url.indexOf('upload.wikimedia.org')+1 && url.indexOf('/thumb/')+1){
			var urlA = url.split('/');
			urlA.pop();
			urlA.splice(urlA.indexOf('thumb'), 1);
			url = urlA.join('/');
		}

		return url;
	}

	enter(ev){
		//if(!ev.altKey && !ev.ctrlKey) return;
		if(!this.container)
			this.create();

		this.container.style.display = 'block';

		console.log('enter', ev);
	}

	hover(ev){
		//if(!ev.altKey && !ev.ctrlKey) return;
		if(!this.container) this.create();

		if(this.container.style.display == 'none'){
			if(this.img.width){
				this.container.style.width = this.img.width+'px';
				this.container.style.height = this.img.height+'px';
				this.container.style.display = 'block';
			}
			else return;

			if(this.container.classList.contains('open'))
				this.textarea.focus();
		};

		Zoomer.active = this;

		var w = parseInt(this.container.style.width),
			h = parseInt(this.container.style.height);

		var shift = 2;

		this.container.style.left = w > document.body.clientWidth?0:(
			((ev.pageX + w) < document.body.clientWidth)?
				(ev.pageX):
				Math.max(0, (ev.pageX - w + 8))
		)+'px';

		this.container.style.top = 22 + ev.pageY+'px';
	  	
	  	console.log(ev.target.src || ev.target.href);
	}

	leave(ev){
		if(!this.container) return;

		//if(!ev.altKey && !ev.ctrlKey) return;

		Zoomer.active = null;

		this.container.style.display = 'none';

		console.log(this.textarea.value);


		if(this.container.classList.contains('open'))
			localStorage.setItem('tag8s$'+this.src, this.textarea.value);
	}

	static parseQS(queryString){
		var params = {}, queries, temp, i, l;
		if(!queryString || !queryString.split('?')[1]) return {};
		queries = queryString.split('?')[1].split("&");

		for(i = 0, l = queries.length; i < l; i++){
			temp = queries[i].split('=');
			params[temp[0]] = temp[1];
		}

		return params;
	}
}

//window.addEventListener('click', click, false);


function reselectImages(target){
	var x = (target || document).querySelectorAll("image,img");
	var i;
	for(i = 0; i < x.length; i++){
		let node = x[i];
		let src = Zoomer.getSrc(node);
		if(src){
			var zoomer = zooms[src] || (new Zoomer(node));
			console.log(zoomer);
		}
	}
};


console.log('pix8zoom initiated');

window.document.addEventListener('DOMSubtreeModified', ev => {
	console.log('DOMSubtreeModified', ev);
	reselectImages(ev.target);
}, false);

reselectImages();

document.addEventListener('keyup', ev => {
	console.log(ev.which);
	if(ev.which == 56 && Zoomer.active && Zoomer.active.container){
		Zoomer.active.container.classList.toggle('open');
		Zoomer.active.textarea[
			Zoomer.active.container.classList.contains('open')?
				'focus':'blur'
		]();
	}
});