import angular from 'angular';
import $ from 'jquery';

export default () => {

    const CLASSNAME = 'nf-tooltip';

    const link = (scope, elem, attrs) => {
        const title = attrs.message;
        if (!title) {
            throw new Error('Tooltip directive requires a message attribute');
        }
        const $elem = $(angular.element(elem));
        $elem.addClass(CLASSNAME);
        $($elem).tooltip({
          trigger: 'click',
          title,
        });

        $('body').on('click', function (e) {
            if (!$elem.is(e.target) && $elem.has(e.target).length === 0 && $(CLASSNAME).has(e.target).length === 0) {
                $($elem).tooltip('hide');
            }
        });
    }
    return {
        restrict: 'A',
        link,
    };
}