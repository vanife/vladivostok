"use strict";
var router_outlet_map_1 = require('./router_outlet_map');
var url_serializer_1 = require('./url_serializer');
var router_state_1 = require('./router_state');
var router_1 = require('./router');
var core_1 = require('@angular/core');
var common_1 = require('@angular/common');
function provideRouter(config) {
    return [
        common_1.Location,
        { provide: common_1.LocationStrategy, useClass: common_1.PathLocationStrategy },
        { provide: url_serializer_1.UrlSerializer, useClass: url_serializer_1.DefaultUrlSerializer },
        {
            provide: router_1.Router,
            useFactory: function (ref, resolver, urlSerializer, outletMap, location) {
                if (ref.componentTypes.length == 0) {
                    throw new Error("Bootstrap at least one component before injecting Router.");
                }
                var componentType = ref.componentTypes[0];
                var r = new router_1.Router(componentType, resolver, urlSerializer, outletMap, location);
                r.resetConfig(config);
                ref.registerDisposeListener(function () { return r.dispose(); });
                return r;
            },
            deps: [core_1.ApplicationRef, core_1.ComponentResolver, url_serializer_1.UrlSerializer, router_outlet_map_1.RouterOutletMap, common_1.Location]
        },
        router_outlet_map_1.RouterOutletMap,
        { provide: router_state_1.ActivatedRoute, useFactory: function (r) { return r.routerState.root; }, deps: [router_1.Router] },
    ];
}
exports.provideRouter = provideRouter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uX3JvdXRlcl9wcm92aWRlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbW9uX3JvdXRlcl9wcm92aWRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLGtDQUFnQyxxQkFBcUIsQ0FBQyxDQUFBO0FBQ3RELCtCQUFvRCxrQkFBa0IsQ0FBQyxDQUFBO0FBQ3ZFLDZCQUErQixnQkFBZ0IsQ0FBQyxDQUFBO0FBQ2hELHVCQUF1QixVQUFVLENBQUMsQ0FBQTtBQUVsQyxxQkFBaUQsZUFBZSxDQUFDLENBQUE7QUFDakUsdUJBQWlFLGlCQUFpQixDQUFDLENBQUE7QUFvQm5GLHVCQUE4QixNQUFvQjtJQUNoRCxNQUFNLENBQUM7UUFDTCxpQkFBUTtRQUNSLEVBQUMsT0FBTyxFQUFFLHlCQUFnQixFQUFFLFFBQVEsRUFBRSw2QkFBb0IsRUFBQztRQUMzRCxFQUFDLE9BQU8sRUFBRSw4QkFBYSxFQUFFLFFBQVEsRUFBRSxxQ0FBb0IsRUFBQztRQUV4RDtZQUNFLE9BQU8sRUFBRSxlQUFNO1lBQ2YsVUFBVSxFQUFFLFVBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLFFBQVE7Z0JBQzVELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ25DLE1BQU0sSUFBSSxLQUFLLENBQUMsMkRBQTJELENBQUMsQ0FBQztnQkFDL0UsQ0FBQztnQkFDRCxJQUFNLGFBQWEsR0FBRyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1QyxJQUFNLENBQUMsR0FBRyxJQUFJLGVBQU0sQ0FBQyxhQUFhLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ2xGLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3RCLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxjQUFNLE9BQUEsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFYLENBQVcsQ0FBQyxDQUFDO2dCQUMvQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ1gsQ0FBQztZQUNELElBQUksRUFBRSxDQUFDLHFCQUFjLEVBQUUsd0JBQWlCLEVBQUUsOEJBQWEsRUFBRSxtQ0FBZSxFQUFFLGlCQUFRLENBQUM7U0FDcEY7UUFFRCxtQ0FBZTtRQUNmLEVBQUMsT0FBTyxFQUFFLDZCQUFjLEVBQUUsVUFBVSxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQWxCLENBQWtCLEVBQUUsSUFBSSxFQUFFLENBQUMsZUFBTSxDQUFDLEVBQUM7S0FDakYsQ0FBQztBQUNKLENBQUM7QUF4QmUscUJBQWEsZ0JBd0I1QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUm91dGVyT3V0bGV0TWFwIH0gZnJvbSAnLi9yb3V0ZXJfb3V0bGV0X21hcCc7XG5pbXBvcnQgeyBVcmxTZXJpYWxpemVyLCBEZWZhdWx0VXJsU2VyaWFsaXplciB9IGZyb20gJy4vdXJsX3NlcmlhbGl6ZXInO1xuaW1wb3J0IHsgQWN0aXZhdGVkUm91dGUgfSBmcm9tICcuL3JvdXRlcl9zdGF0ZSc7XG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tICcuL3JvdXRlcic7XG5pbXBvcnQgeyBSb3V0ZXJDb25maWcgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgeyBDb21wb25lbnRSZXNvbHZlciwgQXBwbGljYXRpb25SZWZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTG9jYXRpb25TdHJhdGVneSwgUGF0aExvY2F0aW9uU3RyYXRlZ3ksIExvY2F0aW9uIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuLyoqXG4gKiBBIGxpc3Qgb2Yge0BsaW5rIFByb3ZpZGVyfXMuIFRvIHVzZSB0aGUgcm91dGVyLCB5b3UgbXVzdCBhZGQgdGhpcyB0byB5b3VyIGFwcGxpY2F0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdfSlcbiAqIGNsYXNzIEFwcENtcCB7XG4gKiAgIC8vIC4uLlxuICogfVxuICpcbiAqIGNvbnN0IHJvdXRlciA9IFtcbiAqICAge3BhdGg6ICcvaG9tZScsIGNvbXBvbmVudDogSG9tZX1cbiAqIF07XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgW3Byb3ZpZGVSb3V0ZXIocm91dGVyKV0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlUm91dGVyKGNvbmZpZzogUm91dGVyQ29uZmlnKTphbnlbXSB7XG4gIHJldHVybiBbXG4gICAgTG9jYXRpb24sXG4gICAge3Byb3ZpZGU6IExvY2F0aW9uU3RyYXRlZ3ksIHVzZUNsYXNzOiBQYXRoTG9jYXRpb25TdHJhdGVneX0sXG4gICAge3Byb3ZpZGU6IFVybFNlcmlhbGl6ZXIsIHVzZUNsYXNzOiBEZWZhdWx0VXJsU2VyaWFsaXplcn0sXG5cbiAgICB7XG4gICAgICBwcm92aWRlOiBSb3V0ZXIsXG4gICAgICB1c2VGYWN0b3J5OiAocmVmLCByZXNvbHZlciwgdXJsU2VyaWFsaXplciwgb3V0bGV0TWFwLCBsb2NhdGlvbikgPT4ge1xuICAgICAgICBpZiAocmVmLmNvbXBvbmVudFR5cGVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQm9vdHN0cmFwIGF0IGxlYXN0IG9uZSBjb21wb25lbnQgYmVmb3JlIGluamVjdGluZyBSb3V0ZXIuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudFR5cGUgPSByZWYuY29tcG9uZW50VHlwZXNbMF07XG4gICAgICAgIGNvbnN0IHIgPSBuZXcgUm91dGVyKGNvbXBvbmVudFR5cGUsIHJlc29sdmVyLCB1cmxTZXJpYWxpemVyLCBvdXRsZXRNYXAsIGxvY2F0aW9uKTtcbiAgICAgICAgci5yZXNldENvbmZpZyhjb25maWcpO1xuICAgICAgICByZWYucmVnaXN0ZXJEaXNwb3NlTGlzdGVuZXIoKCkgPT4gci5kaXNwb3NlKCkpO1xuICAgICAgICByZXR1cm4gcjtcbiAgICAgIH0sXG4gICAgICBkZXBzOiBbQXBwbGljYXRpb25SZWYsIENvbXBvbmVudFJlc29sdmVyLCBVcmxTZXJpYWxpemVyLCBSb3V0ZXJPdXRsZXRNYXAsIExvY2F0aW9uXVxuICAgIH0sXG5cbiAgICBSb3V0ZXJPdXRsZXRNYXAsXG4gICAge3Byb3ZpZGU6IEFjdGl2YXRlZFJvdXRlLCB1c2VGYWN0b3J5OiAocikgPT4gci5yb3V0ZXJTdGF0ZS5yb290LCBkZXBzOiBbUm91dGVyXX0sXG4gIF07XG59XG4iXX0=