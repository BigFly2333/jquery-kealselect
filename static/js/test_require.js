require(['jquery', 'kealselect/jquery.kealselect'], function($, Kealselect) {
  $(function() {
    
      $('#ks3').val(['o1-', 'o3-']);
    
      var kealselect = new KealSelect({
        text: { noneSelected: '==请选择==' },
        el: '.kealselect',
        selectedCb: function(id, selected) {
          console.log(111);
        }
      });
    
      $('#ks3').on('change', function(){
          var $this = $(this);
          // if($this.val() === 'o6') {
            console.log(222);
          // }
        });
    
      // kealselect.setVal("o3");
      kealselect.setVal( "#ks3", ['o1-', 'o3-'], false);
      
      // kealselect.bind('.kealselect', 'selec');
      // kealselect.setOptions('#ks1, #ks2', {
      //   selectedCb: function(id, selected){
      //     console.log('id: ' + id + ',val: ' + selected.val);
      //   }
      // });
      // console.log(kealselect.getAttr('#ks1', 'id'));
      // // kealselect.bind('.kealselect', 'test', {
      // //   cb: function(that) {
      // //     console.log(that);
      // //   }
      // // });
    
      // kealselect._getSelect('#ks1')[0].clear();
      // kealselect._getSelect('#ks3')[0].test();  
    
      $('#clear').on('click', function() {
        kealselect.clear(function() {
          console.log(89283878);
        });
      })
    
      
      for(var i = 1; i<10; i++) {
        var $op = $('<option />')
                  .val(i)
                  .text('--------------------' + i + '-----------------------');
        $('#ks4').append($op);
      }
      kealselect.reload();

      $('#ShowValue').on('click', showValues);
      
    });
    
    function showValues() {
      alert('val: ' + $('#ks3').val() + ',text: ' + $('#ks3').find('option:selected').text());
    }
});