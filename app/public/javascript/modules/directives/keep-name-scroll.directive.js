import angular from 'angular';

const MAX_LEFT_SCROLL = 30;

export default () => {
    const link = (scope, elem, attrs) => {
        const ngElem = angular.element(elem);
        ngElem.on('scroll', () => {
            const scrollLeftDist = ngElem.scrollLeft();
            if (scrollLeftDist > MAX_LEFT_SCROLL) {
                ngElem.attr('data-keep-name', '1');
            } else {
                ngElem.attr('data-keep-name', '0');
            }
        });
    }
    return {
        restrict: 'A',
        link,
    };
}