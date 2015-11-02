angular.module('seeflight.directives')

.directive('datepicker', function() {
  return {
      restrict: 'E',
      templateUrl: 'templates/directives/datepicker.html',
      replace: true,
      scope: {
          value: '=value',
          dateformat: '@',
          showothermonths: '@',
          selectothermonths: '@',
          fieldid: '@',
          yearrange: '@',
          maxdate : '@'
      },
      link: function ($scope, element, attrs) {

        initDatepicker();

        $('#cross-date-picker').click(function(){
          $scope.$apply(function () {
            $scope.value = null;
          });
          $('#'+$scope.fieldid).datepicker("setDate", "" );
          $(this).addClass('hidden');
        });

        function initDatepicker(){
          var minDate = new Date(new Date().getTime()+24*60*60*1000);
          var maxDate = new Date(minDate.getTime()+$scope.maxdate*24*60*60*1000);
          $('#'+$scope.fieldid).datepicker({
            showOtherMonths: $scope.showothermonths==="true",
            selectOtherMonths: $scope.selectothermonths==="true",
            dateFormat: $scope.dateformat,
            yearRange: $scope.yearrange,
            minDate: new Date(new Date().getTime()+24*60*60*1000),
            maxDate: maxDate,
            onSelect : function(dateText, instance){
              var selectedDate = $('#'+$scope.fieldid).datepicker("getDate");
              $scope.$apply(function () {
                $scope.value = selectedDate.getTime().toString();
              });
              $('#cross-date-picker').removeClass('hidden');
            }
          }).prev('.input-group-btn').on('click', function (e) {
            e && e.preventDefault();
            $('#'+$scope.fieldid).focus();
          });
          
          $.extend($.datepicker, { _checkOffset: function (inst,offset,isFixed) { return offset; } });
          $('#'+$scope.fieldid).datepicker('widget').css({ 'margin-left': -$('#'+$scope.fieldid).prev('.input-group-btn').find('.btn').outerWidth() + 3 });
        }
      }
  }
});