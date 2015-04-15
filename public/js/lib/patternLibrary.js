window.patternlibrary = {

	displayModal: function (element) {
		var modal = document.createElement ("div");
		modal.classList.add ("modalWindow");

		if(element.innerHTML === undefined) { // support for document fragments
			modal.appendChild(element.cloneNode(true));
		}
		else
		{ // supports passing in container elements (<div><header></header>blah blah</div>)
			modal.innerHTML = element.innerHTML;
		}
		var modalBackground = document.createElement ("div");
		modalBackground.classList.add ("modalBackground");
		document.body.classList.toggle ("blur");
		document.body.appendChild (modalBackground);
		document.body.appendChild (modal);
		var header = modal.getElementsByTagName ("header") [0];
		var modalClose = document.createElement ("button");
		modalClose.classList.add ("modalClose");
		header.appendChild (modalClose);
		modalClose.onclick = closeModal;

		function closeModal ()  {
			modal.parentNode.removeChild (modal);
			modalBackground.parentNode.removeChild (modalBackground);
			document.body.classList.toggle ("blur");
		}
		return closeModal;
	},
	displayDropDown: function (element) {
		var dropDown = document.createElement ("div");
		dropDown.classList.add ("dropDown");
		dropDown.innerHTML = element.innerHTML;
		document.body.appendChild (dropDown);
		var dropDownClose = document.createElement ("button");
		dropDownClose.classList.add ("dropDownClose");
		header.appendChild (dropDownClose);
		dropDownClose.onclick = closedropDown;

	}
}

jQuery(document).ready(function() {
    jQuery('#openDropDown').click(function() {
        jQuery('#dropDown').toggleClass('showMe');
    });

    jQuery(document).mouseup(function (e) {
        var container = jQuery("#dropDown, #openDropDown"); //defines the "clickable area" as the menu button and both menus

        if (!container.is(e.target) // IF the target of the click isn't the "clickable area"...
            && container.has(e.target).length === 0) // ... nor a descendant of the "clickable area"
        {
            jQuery('#dropDown').toggleClass('showMe');//THEN hid the main menu...
        }
    });

});

