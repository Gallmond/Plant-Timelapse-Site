document.addEventListener('DOMContentLoaded', ()=>{ 

	window.imgCache = <%- JSON.stringify(inMemoryBuckets) %>;

	// calculate window width
	var ratio = window.devicePixelRatio || 1;
	var w = screen.width * ratio;
	var h = screen.height * ratio;
	console.log("ratio",ratio);
	console.log("w",w);
	console.log("h",h);

	var calcWidth = screen.width;
	var calcHeight = Math.round(calcWidth*0.75);

	if(calcWidth > 640 || calcHeight > 480){
		calcWidth = 640;
		calcHeight = 480;
	}


	var options = {
		containerDiv: "viewer_container",
		controlsDiv: "viewer_controls",
		defaultRange: 10,
		img_width: calcWidth,
		img_height: calcHeight,
		debug:false,

		loadOnViewOnly: true, 
		// true: only loads image src when it would be displayed on-screen.
		// false: loads image sources as soon as the range is set
	}
	window.lightBox = new lightBoxClass(options);


});// DOMContentLoaded end



function lightBoxClass(_options){
	this.options = _options;
	this.imgCache = window.imgCache;
	this.containerDiv = document.getElementById(this.options.containerDiv);
	this.controlsDiv = document.getElementById(this.options.controlsDiv);

	// sizing
	this.containerDiv.style.height = this.options.img_height+"px";
	this.containerDiv.style.width = this.options.img_width+"px";

	// show loader
	this.loadingPanel = document.createElement('img');
	this.loadingPanel.src = "/loading.jpg";
	this.loadingPanel.style.height = this.options.img_height+"px";
	this.loadingPanel.style.width = this.options.img_width+"px";
	this.loadingPanel.style.position = "absolute";
	this.containerDiv.appendChild(this.loadingPanel);

	// controls state
	this.isScrolling = false;

	// add debug
	if(this.options.debug){
		var debugBox = document.createElement('div');
		debugBox.id = "debug";
		document.body.appendChild(debugBox);
	}

	// make the controls
	this.createControlsDivs = ()=>{

		// make the timestamp container and add it to the controls container
		var currentTimestampHolder = document.createElement('span');
		currentTimestampHolder.id = "currentkey_date";
		currentTimestampHolder.style.width = "100%";
		this.controlsDiv.appendChild(currentTimestampHolder);

		// bar to contain the 30 day and autoscroll buttons
		var buttonsContainer = document.createElement('div');
		buttonsContainer.style.width = "100%";
		this.controlsDiv.appendChild(buttonsContainer);

		// button to show noon this month
		var thisMonthButton  = document.createElement('button');
		thisMonthButton.innerHTML = "30 days";
		thisMonthButton.style.height = "50px";
		thisMonthButton.style.width = "50%";
		thisMonthButton.addEventListener("click", (e)=>{
			e.stopPropagation();
			// create ranges
			var now = new Date();
			var ranges = [];
			for (var i = 0; i < 30; i++) {
				var timeDiff = (1000*60*60*24)*i;
				var thisFrom = new Date( now.valueOf() - timeDiff );
				thisFrom.setUTCHours(11,0,0); // 0-23

				var thisTo = new Date( now.valueOf() - timeDiff );
				thisTo.setUTCHours(12,0,0);

				ranges.push({from:thisFrom.valueOf(), to:thisTo.valueOf(), num:1});
			};
			this.displayRanges(ranges);
		}, false);
		buttonsContainer.appendChild(thisMonthButton);

		// button to control autoscroll
		var toggleAutoScrollButton = document.createElement('button');
		toggleAutoScrollButton.innerHTML = "Auto scroll";
		toggleAutoScrollButton.style.height = "50px";
		toggleAutoScrollButton.style.width = "50%";
		toggleAutoScrollButton.addEventListener("click", (e)=>{
			e.stopPropagation();
			var thisButton = e.target;
			if(this.isScrolling){// is on, turn off
				this.toggleAutoScroll(false);
				thisButton.style.border = "2px outset";
			}else{// is off, turn on
				this.toggleAutoScroll(333);
				thisButton.style.border = "2px inset";
			}
			this.isScrolling = !this.isScrolling;
		}, false);
		buttonsContainer.appendChild(toggleAutoScrollButton);

		// RANGE FORM START
		var datePickerForm = document.createElement('form');
		var toDatePicker = document.createElement('input'); // <input type="date" id="cal">
		var fromDatePicker = document.createElement('input');
		var toDatePickerLabel = document.createElement('label'); 
		var fromDatePickerLabel = document.createElement('label');
		var formSubmit = document.createElement('button');
		var displayTimeRangeCheckBox = document.createElement('input'); // <input id="checkBox" type="checkbox">
		var displayTimeRangeCheckBoxLabel = document.createElement('label');
		displayTimeRangeCheckBox.type = "checkbox";
		displayTimeRangeCheckBox.id = "all_or_none";
		displayTimeRangeCheckBoxLabel.innerHTML = "Show all images?"
		displayTimeRangeCheckBoxLabel.htmlFor = "all_or_none";
		displayTimeRangeCheckBoxLabel.style.fontSize = "2em";
		formSubmit.innerHTML = "Show range";
		formSubmit.type = "submit";
		formSubmit.style.height = "50px";
		formSubmit.style.width = "100%";

		toDatePicker.type = "date";
		toDatePicker.id = "to_cal";
		toDatePicker.style.width = "100%";
		toDatePicker.style.height = "50px";
		toDatePicker.style.textAlign = "center";
		fromDatePicker.type = "date";
		fromDatePicker.id = "from_cal";
		fromDatePicker.style.width = "100%";
		fromDatePicker.style.height = "50px";
		fromDatePicker.style.textAlign = "center";
		toDatePickerLabel.htmlFor = "to_cal";
		toDatePickerLabel.innerHTML = "Select range end";
		toDatePickerLabel.style.fontSize = "2em";
		fromDatePickerLabel.htmlFor = "from_cal";
		fromDatePickerLabel.innerHTML = "Select range start";
		fromDatePickerLabel.style.fontSize = "2em";
		datePickerForm.id = "showrange_form";
		datePickerForm.addEventListener("submit", (e)=>{
			e.preventDefault();
			e.stopPropagation();
			// get date strings (yyyy-mm-dd);
			var fromVal = document.getElementById("from_cal").value;
			var toVal = document.getElementById("to_cal").value;
			var showAll = document.getElementById("all_or_none").checked;
			if(fromVal=="" || toVal==""){
				return false;
			}
			// create JS dates to get day difference
			var jsFrom = new Date();
			jsFrom.setFullYear( parseInt(fromVal.split("-")[0]), parseInt(fromVal.split("-")[1] - 1), parseInt(fromVal.split("-")[2]) );
			jsFrom.setUTCHours(12,0,0);
			var jsTo = new Date();
			jsTo.setFullYear( parseInt(toVal.split("-")[0]), parseInt(toVal.split("-")[1] - 1), parseInt(toVal.split("-")[2]) );
			jsTo.setUTCHours(12,0,0);

			var daysDiff = Math.round((jsTo - jsFrom)/(1000*60*60*24));
			var ranges = [];
			for (var i = 0; i <= daysDiff; i++) {
				var numToShow = 1;
				var timeDiff = (1000*60*60*24)*i;
				var thisFrom = new Date( jsFrom.valueOf() + timeDiff );
				thisFrom.setUTCHours(11,0,0); // 0-23
				var thisTo = new Date( jsFrom.valueOf() + timeDiff );
				thisTo.setUTCHours(12,0,0);
				if(showAll){
					numToShow = 99;
					thisFrom.setUTCHours(0,0,0); // 0-23
					thisTo.setUTCHours(23,0,0); // 0-23
				}
				ranges.push({from:thisFrom.valueOf(), to:thisTo.valueOf(), num:numToShow});
			};
			ranges.reverse();
			this.displayRanges(ranges);
		}, false);

		// build form divs
		var top_left_div = document.createElement('div');
		top_left_div.appendChild(fromDatePickerLabel);
		top_left_div.appendChild(document.createElement('br'));
		top_left_div.appendChild(fromDatePicker);
		top_left_div.style.width = "50%";
		top_left_div.style.padding = "5px";
		top_left_div.style.display = "inline-block";

		var top_right_div = document.createElement('div');
		top_right_div.appendChild(toDatePickerLabel);
		top_right_div.appendChild(document.createElement('br'));
		top_right_div.appendChild(toDatePicker);
		top_right_div.style.width = "50%";
		top_right_div.style.padding = "5px";
		top_right_div.style.display = "inline-block";

		var bottom_left_div = document.createElement('div');
		bottom_left_div.appendChild(displayTimeRangeCheckBoxLabel);
		bottom_left_div.appendChild(document.createElement('br'));
		bottom_left_div.appendChild(displayTimeRangeCheckBox);
		bottom_left_div.style.width = "50%";
		bottom_left_div.style.padding = "5px";
		bottom_left_div.style.display = "inline-block";

		var bottom_right_div = document.createElement('div');
		bottom_right_div.appendChild(formSubmit);
		bottom_right_div.style.width = "50%";
		bottom_right_div.style.padding = "5px";
		bottom_right_div.style.display = "inline-block";

		datePickerForm.appendChild(top_left_div);
		datePickerForm.appendChild(top_right_div);
		datePickerForm.appendChild(bottom_left_div);
		datePickerForm.appendChild(bottom_right_div);

		this.controlsDiv.appendChild(datePickerForm);
		// RANGE FORM END



	};// createControlsDivsEnd


	this.viewableTags = [];
	this.keys = [];

	// hide
	this.containerDiv.style.display = "hidden";
	var imageCount = 0;
	for(var bucketName in this.imgCache.buckets){ // insert a blank tag for every image
		for (var i = 0; i < this.imgCache.buckets[bucketName].length; i++) {
			this.keys.push(this.imgCache.buckets[bucketName][i]);
			var srcString = "https://s3.eu-west-2.amazonaws.com/"+bucketName+"/"+this.imgCache.buckets[bucketName][i];
			var testImg = document.createElement('img');
			testImg.dataset.unloadedsrc = srcString;
			testImg.dataset.bucket = bucketName;
			testImg.dataset.key = this.imgCache.buckets[bucketName][i];
			testImg.dataset.iscached = "false"; // .complete returns true when it shouldn't
			testImg.onload = function(){ if(this.src!=undefined && this.src!=""){this.dataset.iscached = "true";} } // .complete returns true when it shouldn't
			testImg.style.height = this.options.img_height+"px";
			testImg.style.width = this.options.img_width+"px";
			testImg.style.position = "absolute";

			// load if in default range
			if(imageCount < this.options.defaultRange){
				testImg.src = srcString;
				this.viewableTags.push(testImg);
			}

			// display most recent by default
			if(imageCount!=0){
				testImg.style.display = "none";	
			}
			this.containerDiv.appendChild(testImg);
			imageCount++;
		}
	}
	// show
	this.containerDiv.style.display = "";


	// ========= functions to alter the viewable tags
	this.clearViewable = ()=>{
		// hide current
		this.hideAll();
		this.viewableTags = [];
		console.log("cleared viewableTags");
	}
	this.displayRanges = (_arrayOfRanges)=>{ // range like [{to: 123456, from: 987654, num: 5}, ... ];
		this.clearViewable();
		var useTheseKeys = [];
		// for all ranges
		for (var ii = 0; ii < _arrayOfRanges.length; ii++) {
			var jsFrom = new Date(_arrayOfRanges[ii].from);
			var jsTo = new Date(_arrayOfRanges[ii].to); 
			console.log("checking range:", ii);
			console.log("jsFrom:", jsFrom);
			console.log("jsTo:", jsTo);

			// validity check			
			if( (_arrayOfRanges[ii].from == undefined ) || (_arrayOfRanges[ii].to == undefined ) || (_arrayOfRanges[ii].num == undefined ) || ( !jsFrom.valueOf() ) || ( !jsTo.valueOf() ) ){
				console.log("invalid range object:", _arrayOfRanges[ii])
				return false;
			}
			var maxKeysInRange = _arrayOfRanges[ii].num;
			var keysInThisRange = 0;
			// check keys in this range
			for (var i = 0; i < this.keys.length; i++) {
				var thisKey = this.keys[i];
				var jsKey = this.jsDateFromKey(thisKey);
				// if this range filled, skip
				if( keysInThisRange >= maxKeysInRange ){
					break;
				}
				// if in range
				if( (jsKey < jsTo) && (jsKey > jsFrom) ){
					console.log("added key to viewableTags:", thisKey);
					if(useTheseKeys.indexOf(thisKey)== -1){
						useTheseKeys.push(thisKey)	
						keysInThisRange++;
					}
				}
			};
		};
		// populate viewable
		for (var i = 0; i < useTheseKeys.length; i++) {
			this.viewableTags.push( this.getTagFromKey( useTheseKeys[i] ) );
		};
		// load now if poss
		if(!this.loadOnViewOnly){
			for (var i = 0; i < this.viewableTags.length; i++) {
				this.loadSrc(this.viewableTags[i]); 
			}
		}
		// set first to visible
		this.viewableTags[0].style.display = "";
		console.log("updated viewableTags: "+this.viewableTags.length);
	}
	this.scrollInfo = {
		prevIndex:0,
		currentIndex:0,
		scrollInterval:false,
	}
	this.toggleAutoScroll = ( _timeDelay )=>{ // autoscrolls through the visibletags
		clearInterval(this.scrollInfo.scrollInterval);
		if(_timeDelay == false){
			return true;
		}

		this.hideAll();
		// start at oldest.
		this.scrollInfo.currentIndex = this.viewableTags.length-1;
		console.log("this.scrollInfo", this.scrollInfo);
		this.show( this.scrollInfo.currentIndex );
		this.scrollInfo.scrollInterval = setInterval(()=>{

			this.hideAll();

			// display next,
			var prevIndex = this.scrollInfo.currentIndex; 
			var newIndex = this.scrollInfo.currentIndex - 1;
			if(newIndex<0) newIndex = this.viewableTags.length-1;
			this.show(newIndex);

			// hide prev
			this.hide(prevIndex);

			// update thing
			this.scrollInfo.prevIndex = prevIndex;
			this.scrollInfo.currentIndex = newIndex;

		}, _timeDelay, this.viewableTags);

	}


	// ========= functions to load/display a tag
	this.hideAll = ()=>{
		for (var i = 0; i < this.viewableTags.length; i++) {
			this.viewableTags[i].style.display = "none";
		};
	}
	this.show = (_segment)=>{
		if(this.viewableTags[_segment].src==undefined || this.viewableTags[_segment].src==""){
			this.loadSrc( this.viewableTags[_segment] );	
		}
		this.viewableTags[_segment].style.display = "";
		// temp show date
		document.getElementById("currentkey_date").innerHTML = this.jsDateFromKey( this.viewableTags[_segment].dataset.key ).toUTCString();
	}
	this.hide = (_segment)=>{
		this.viewableTags[_segment].style.display = "none";
	}


	// ======== add mouseover logic
	this.lastseg = 0;
	this.moveLogic = (e)=>{
		e.stopPropagation(); // prevent bubbling
		var rect = e.target.getBoundingClientRect();

		// if touch
		if(e.type == "touchmove"){
			var x = e.changedTouches[0].clientX - rect.left; //x position within the element.
		}else{
			var x = e.clientX - rect.left; //x position within the element.
		}
		
		x = Math.ceil(x);

		// % of distance along the line the point is
		var cursor_pt = ((x/this.options.img_width)*100); // where IMAGE_WIDTH is line length
		cursor_pt = Math.ceil(cursor_pt); // rounded up
		// size of segments
		var segment_size = 100/this.viewableTags.length; 
		// number of the segment the point is in
		var cursor_segment = Math.ceil(cursor_pt/segment_size); 
		var segment = (cursor_segment!=0?cursor_segment:1);
		segment = (segment>this.viewableTags.length?this.viewableTags.length:segment);
		// invert segment (as the segments are number 0 being at the left)
		var segmentToUse = (this.viewableTags.length - (segment-1))-1;
		if(this.options.debug) debug("x:"+x+" segCount:"+this.viewableTags.length+" sizeSeg:"+segment_size+" calcSec:"+cursor_segment+" inverted:"+segmentToUse);
		// can this segment be displayed?
		if(segmentToUse != this.lastseg){
			// if lastseg is out of range, reset it
			if(this.lastseg >= this.viewableTags.length){
				this.lastseg = this.viewableTags.length-1;
			}

			this.show(segmentToUse);
			this.hide(this.lastseg);
			this.lastseg = segmentToUse;
		}
	};
	this.containerDiv.addEventListener("mousemove", this.moveLogic, false);
	this.containerDiv.addEventListener("touchmove", this.moveLogic, false);


	// ======== imcache manip functions
	this.jsDateFromKey = (_key)=>{
		var dateString = _key.substring(0, _key.indexOf("."));
		var YYYY = dateString.substring(0,4);
		var MM = dateString.substring(4,6);
		var DD = dateString.substring(6,8);
		var hh = dateString.substring(9,11);
		var mm = dateString.substring(11,13);
		var ss = dateString.substring(13,15);
		var UTCString = YYYY+"-"+MM+"-"+DD+"T"+hh+":"+mm+":"+ss+"Z"; //2011-04-11T10:20:30Z
		return new Date(UTCString);
	}
	this.getTagFromKey = (_key)=>{
		if(_key.indexOf(".jpg")==-1){
			_key+=".jpg";
		}
		return this.containerDiv.querySelector('[data-key="'+_key+'"]');
	}
	this.loadSrc = (_imgTag)=>{
		if(_imgTag.src == undefined || _imgTag.src == ""){
			_imgTag.src = _imgTag.dataset.unloadedsrc;
		}
	}

	this.createControlsDivs();

}



var debug = (_str)=>{
	document.getElementById('debug').innerHTML=_str;
};