(function() {
    'use strict';

    describe('ProductController with spies on ProductService.getList', function() {

        var testCtrl, productService;
        beforeEach(module('product'));

        beforeEach(inject(function($controller, ProductService) {
            productService = ProductService;
            spyOn(productService, 'getList').andCallThrough();
            testCtrl = $controller('ProductController');
        }));

        it('should call ProductService.getList', function() {
            expect(productService.getList).toHaveBeenCalled();
            expect(productService.getList.callCount).toEqual(1);
            expect(testCtrl.products.length).toEqual(0);
        });
    });

    describe('ProductController with mocked $http calls', function() {

        beforeEach(module('product'));

        var testCtrl, httpBackend;

        beforeEach(inject(function($controller, $httpBackend) {
            httpBackend = $httpBackend;
            httpBackend.expectGET('data/products.json')
                .respond(404, {msg: 'Not Found'});
            testCtrl = $controller('ProductController');
        }));

        it('should load products from $httpBackend', function() {
            //controller instantiated
            expect(testCtrl.products).toEqual([]);

            //simulate server response
            httpBackend.flush();

            //and check the error message
            expect(testCtrl.errorMessage).toEqual('Not Found');
        });


        afterEach( function() {
            // Ensure that all expects set on the $ httpBackend
            // were actually called
            httpBackend.verifyNoOutstandingExpectation();

            // Ensure that all requests to the server
            // have actually responded (using flush())
            httpBackend.verifyNoOutstandingRequest();
        });

    });

})();
