window.HLRDESK = window.HLRDESK || {};
window.HLRDESK.init = window.HLRDESK.init || {};

window.HLRDESK.init.editCatalog = function initCheckout() {

  window.HLRDESK.plugins.search({
    search: '#editCatalog-search',
    results: '#editCatalog-search-results',
    
    clickCallback: function()
    {
      console.log(this.dataset.call);
      //TODO: get database info to populate the box
      var item = this;
      var editItem = document.getElementById('editItem');
      openModal = window.patternlibrary.displayModal(editItem);
      $('#callNumber').attr('placeholder', this.dataset.call);
      hideCheckedOut: false
    }
  });

}
