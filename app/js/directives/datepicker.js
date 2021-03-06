angular.module('seeflight.directives')

.directive('datepicker', function() {
  return {
      restrict: 'E',
      templateUrl: 'templates/directives/datepickerDeparture.html',
      replace: true,
      scope: {
          value: '=value',
          settings : '=settings',
          dateformat: '@',
          showothermonths: '@',
          selectothermonths: '@',
          fieldid: '@',
          yearrange: '@',
          mindate : '@',
          maxdate : '@'
      },
      compile: function compile(tElement, tAttrs, transclude){
        $(tElement[0]).find(".date-picker-input").attr('id', tAttrs.fieldid);
        $(tElement[0]).find(".cross-date-picker").attr('id', "cross-"+tAttrs.fieldid);
        return {
          post: function postLink($scope, element, attrs, controller) {
            initDatepicker();

            $('#cross-'+$scope.fieldid).click(function(){
              $scope.$apply(function () {
                $scope.value = null;
              });
              $('#'+$scope.fieldid).datepicker("setDate", "" );
              $(this).addClass('hidden');
            });

            function initDatepicker(){
              $scope.idElement = $scope.fieldid;

              var minDate = new Date(parseInt($scope.mindate));
              var maxDate = new Date(parseInt($scope.maxdate));
              $('#'+$scope.fieldid).datepicker({
                showOtherMonths: $scope.showothermonths==="true",
                selectOtherMonths: $scope.selectothermonths==="true",
                dateFormat: $scope.dateformat,
                minDate: minDate,
                maxDate: maxDate,
                onSelect : function(dateText, instance){
                  var selectedDate = $('#'+$scope.fieldid).datepicker("getDate");
                  $scope.$apply(function () {
                    $scope.value = selectedDate.getTime().toString();
                    $scope.settings.mobileState = Math.floor(Math.floor((selectedDate.getTime()-new Date().getTime())/60/60/24/1000)/5);
                    $scope.settings.desktopState = Math.floor(Math.floor(Math.floor((selectedDate.getTime()-new Date().getTime())/60/60/24/1000)/5)/$scope.settings.maxColumnsDisplayed)*$scope.settings.maxColumnsDisplayed;
                  });
                  $('#cross-'+$scope.fieldid).removeClass('hidden');
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
      }
    }
})
