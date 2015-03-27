window.patternlibrary = {

	displayModal: function (element) {
		var modal = document.createElement ("div");
		modal.classList.add ("modalWindow");
		modal.innerHTML = element.innerHTML;
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
	displayDropDown: function () {
		var dropDown = document.createElement ("div");
		dropDown.classList.add ("dropDown");
		dropDown.innerHTML = element.innerHTML;
	}
}
